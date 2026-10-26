import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { after, before, beforeEach, describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { seedProjects } from "../src/lib/seed";

describe("PostgreSQL content schema", () => {
  let database: PGlite;
  let migration: string;
  let adminMigration: string;

  before(async () => {
    database = new PGlite();
    migration = await readFile(resolve("db/migrations/001_initial.sql"), "utf8");
    await database.exec(migration);
    // Better Auth owns its tables; this minimal fixture exercises our FK only.
    await database.exec('CREATE TABLE public."user" (id text PRIMARY KEY)');
    adminMigration = await readFile(resolve("db/migrations/002_admins_and_limits.sql"), "utf8");
    await database.exec(adminMigration);
  });

  beforeEach(async () => {
    await database.exec('TRUNCATE hero, contact_settings, projects, inquiries, admins, request_limits, "user"');
  });

  after(async () => {
    await database?.close();
  });

  it("stores all supplied drafts and only exposes published projects to the public query", async () => {
    for (const project of seedProjects) {
      await database.query(
        "INSERT INTO projects (id, slug, title, location, sort_order) VALUES ($1, $2, $3, $4, $5)",
        [project.id, project.slug, project.title, project.location, project.sort_order],
      );
    }
    assert.equal((await database.query("SELECT id FROM projects")).rows.length, 25);
    assert.equal((await database.query("SELECT id FROM projects WHERE status = 'published'")).rows.length, 0);

    await database.query(
      "UPDATE projects SET status = 'published', description = $1, cover_url = $2, featured = true WHERE id = $3",
      ["ინდივიდუალური ავეჯი", "/images/hero.jpg", seedProjects[1].id],
    );
    const publicRows = await database.query<{ id: string }>(
      "SELECT id FROM projects WHERE status = 'published' ORDER BY sort_order ASC, created_at DESC",
    );
    assert.deepEqual(publicRows.rows, [{ id: seedProjects[1].id }]);
    assert.equal((await database.query(
      "SELECT id FROM projects WHERE slug = $1 AND status = 'published'", [seedProjects[0].slug],
    )).rows.length, 0);

    await database.query("UPDATE projects SET status = 'draft' WHERE id = $1", [seedProjects[1].id]);
    assert.equal((await database.query("SELECT id FROM projects WHERE status = 'published' AND featured = true")).rows.length, 0);
  });

  it("rejects duplicate slugs and invalid project states at the database boundary", async () => {
    await database.query("INSERT INTO projects (slug, title) VALUES ($1, $2)", ["test-project", "პროექტი"]);
    await assert.rejects(
      database.query("INSERT INTO projects (slug, title) VALUES ($1, $2)", ["test-project", "სხვა პროექტი"]),
      { code: "23505" },
    );
    for (const statement of [
      "UPDATE projects SET slug = '../admin'",
      "UPDATE projects SET status = 'unknown'",
      "UPDATE projects SET title = '   '",
      "UPDATE projects SET year = 2101",
      "UPDATE projects SET sort_order = -1",
    ]) {
      await assert.rejects(database.query(statement), { code: "23514" });
    }
  });

  it("preserves gallery ordering and rejects malformed or oversized JSON galleries", async () => {
    const images = ["https://images.example.com/second.webp", "/images/first.jpg"];
    await database.query("INSERT INTO projects (slug, title, images) VALUES ($1, $2, $3::jsonb)", [
      "gallery-project", "გალერეა", JSON.stringify(images),
    ]);
    const stored = await database.query<{ images: string[] }>("SELECT images FROM projects");
    assert.deepEqual(stored.rows[0].images, images);

    for (const malformed of [{ url: "/photo.jpg" }, [123], [null], [["/nested.jpg"]], Array(31).fill("/photo.jpg")]) {
      await assert.rejects(
        database.query("UPDATE projects SET images = $1::jsonb", [JSON.stringify(malformed)]),
        { code: "23514" },
        `Gallery must reject ${JSON.stringify(malformed)}`,
      );
    }
  });

  it("enforces one hero and one contact settings row", async () => {
    await database.query("INSERT INTO hero (title) VALUES ($1)", ["ავეჯი თქვენი სივრცისთვის"]);
    await database.query("INSERT INTO contact_settings DEFAULT VALUES");
    await assert.rejects(database.query("INSERT INTO hero (id, title) VALUES (2, 'another hero')"), { code: "23514" });
    await assert.rejects(database.query("INSERT INTO contact_settings (id) VALUES (2)"), { code: "23514" });
    await assert.rejects(database.query("INSERT INTO hero (title) VALUES ('duplicate')"), { code: "23505" });
    await assert.rejects(database.query("INSERT INTO contact_settings DEFAULT VALUES"), { code: "23505" });
  });

  it("stores a Georgian inquiry as unread and allows marking it read", async () => {
    const result = await database.query<{ id: string; status: string; message: string }>(
      "INSERT INTO inquiries (name, email, message) VALUES ($1, $2, $3) RETURNING id, status, message",
      ["ნინო", "nino@example.com", "მსურს ავეჯის შეკვეთა."],
    );
    assert.equal(result.rows[0].status, "new");
    assert.equal(result.rows[0].message, "მსურს ავეჯის შეკვეთა.");
    await database.query("UPDATE inquiries SET status = 'read' WHERE id = $1", [result.rows[0].id]);
    assert.equal((await database.query("SELECT id FROM inquiries WHERE status = 'new'")).rows.length, 0);
    await assert.rejects(database.query("UPDATE inquiries SET status = 'deleted'"), { code: "23514" });
  });

  it("rejects empty, short and oversized inquiries without storing them", async () => {
    for (const [name, email, message] of [
      [" ", "nino@example.com", "მსურს ავეჯის შეკვეთა."],
      ["ნინო", "", "მსურს ავეჯის შეკვეთა."],
      ["ნინო", "nino@example.com", "მოკლე"],
      ["ნინო", "nino@example.com", "ა".repeat(5001)],
    ]) {
      await assert.rejects(database.query(
        "INSERT INTO inquiries (name, email, message) VALUES ($1, $2, $3)", [name, email, message],
      ), { code: "23514" });
    }
    assert.equal((await database.query("SELECT id FROM inquiries")).rows.length, 0);
  });

  it("can reapply the schema without losing existing content", async () => {
    await database.query("INSERT INTO projects (slug, title) VALUES ($1, $2)", ["retained-project", "შენახული პროექტი"]);
    await database.exec(migration);
    await database.exec(adminMigration);
    const result = await database.query<{ title: string }>("SELECT title FROM projects WHERE slug = 'retained-project'");
    assert.equal(result.rows[0].title, "შენახული პროექტი");
  });

  it("only grants admin access to existing users and removes grants when users are deleted", async () => {
    await assert.rejects(database.query("INSERT INTO admins (user_id) VALUES ('missing-user')"), { code: "23503" });
    await database.query('INSERT INTO "user" (id) VALUES ($1)', ["admin-user"]);
    await database.query("INSERT INTO admins (user_id) VALUES ($1)", ["admin-user"]);
    await assert.rejects(database.query("INSERT INTO admins (user_id) VALUES ('admin-user')"), { code: "23505" });
    await database.query('DELETE FROM "user" WHERE id = $1', ["admin-user"]);
    assert.equal((await database.query("SELECT user_id FROM admins")).rows.length, 0);
  });

  it("persists positive request counters with one row per quota key", async () => {
    await database.query("INSERT INTO request_limits (key, window_start, count) VALUES ('contact:test', now(), 1)");
    const updated = await database.query<{ count: number }>(
      "UPDATE request_limits SET count = count + 1 WHERE key = 'contact:test' RETURNING count",
    );
    assert.equal(updated.rows[0].count, 2);
    await assert.rejects(database.query(
      "INSERT INTO request_limits (key, window_start, count) VALUES ('contact:test', now(), 1)",
    ), { code: "23505" });
    await assert.rejects(database.query("UPDATE request_limits SET count = 0"), { code: "23514" });
  });
});

describe("project categories migration", () => {
  let database: PGlite;

  before(async () => {
    database = new PGlite();
    for (const name of ["001_initial.sql", "003_english_content.sql"]) await database.exec(await readFile(resolve("db/migrations", name), "utf8"));
    await database.query("INSERT INTO projects (slug, title, title_en) VALUES ('khedi-hotel', 'ხედი', 'Khedi - Hotel'), ('domus-office', 'დომუსი', 'Domus - Head Office'), ('cafe-cela', 'Cela', 'Cela - Cafe')");
    await database.exec(await readFile(resolve("db/migrations/005_project_categories.sql"), "utf8"));
  });

  after(async () => {
    await database?.close();
  });

  it("adds the four starting categories and files existing hotels and offices", async () => {
    const categories = await database.query<{ name_en: string }>("SELECT name_en FROM project_categories ORDER BY sort_order");
    assert.deepEqual(categories.rows.map(row => row.name_en), ["Hotels", "Offices", "Private order", "Public places"]);
    const filed = await database.query<{ slug: string; name_en: string | null }>(
      "SELECT p.slug, c.name_en FROM projects p LEFT JOIN project_categories c ON c.id = p.category_id ORDER BY p.slug",
    );
    assert.deepEqual(filed.rows, [{ slug: "cafe-cela", name_en: null }, { slug: "domus-office", name_en: "Offices" }, { slug: "khedi-hotel", name_en: "Hotels" }]);
  });

  it("keeps projects when their category is deleted and rejects unknown categories", async () => {
    const { rows: [added] } = await database.query<{ id: string }>("INSERT INTO project_categories (name, name_en) VALUES ('რესტორნები', 'Restaurants') RETURNING id");
    await database.query("UPDATE projects SET category_id = $1 WHERE slug = 'cafe-cela'", [added.id]);
    await database.query("DELETE FROM project_categories WHERE id = $1", [added.id]);
    assert.deepEqual((await database.query("SELECT category_id FROM projects WHERE slug = 'cafe-cela'")).rows, [{ category_id: null }]);
    await assert.rejects(database.query("UPDATE projects SET category_id = gen_random_uuid() WHERE slug = 'cafe-cela'"), { code: "23503" });
    await assert.rejects(database.query("INSERT INTO project_categories (name) VALUES ('  ')"), { code: "23514" });
  });
});
