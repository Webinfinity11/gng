import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultContact, seedProjects } from "../src/lib/seed";
import {
  contactSettingsSchema,
  inquirySchema,
  isSafeLink,
  projectSchema,
} from "../src/lib/validation";
import { slugify, uniqueSlug } from "../src/lib/slug";

describe("editor links", () => {
  it("accepts local routes and HTTPS image URLs", () => {
    for (const value of ["/projects", "/images/hero.jpg", "https://images.example.com/projects/table.webp"]) {
      assert.equal(isSafeLink(value), true, value);
    }
    assert.equal(isSafeLink("/projects", false), false);
  });

  it("rejects executable, credential-bearing and disguised external links", () => {
    for (const value of [
      "javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "http://example.com",
      "//example.com",
      "/\\example.com",
      "https://user:password@example.com",
      "https://example.com\n/path",
      "/projects\u0000",
    ]) {
      assert.equal(isSafeLink(value), false, JSON.stringify(value));
    }
  });
});

describe("content validation", () => {
  it("keeps the 25 supplied projects valid, publishing only those with supplied photographs", () => {
    assert.equal(seedProjects.length, 25);
    assert.equal(new Set(seedProjects.map(project => project.id)).size, 25);
    assert.equal(new Set(seedProjects.map(project => project.slug)).size, 25);
    const published = seedProjects.filter(project => project.status === "published").map(project => project.slug);
    assert.deepEqual(published.sort(), ["coca-cola-bottlers-georgia", "holiday-inn-avlabari", "khedi-hotel", "vazisubani-estate"]);
    for (const project of seedProjects) {
      assert.equal(projectSchema.safeParse(project).success, true, project.slug);
      assert.equal(project.description, "");
      assert.equal(project.year, null);
      assert.equal(project.featured, project.status === "published");
      assert.equal(Boolean(project.cover_url), project.status === "published");
      if (project.status === "draft") assert.deepEqual(project.images, []);
      else assert.equal(project.images.length, 3);
      assert.equal(project.created_at, undefined);
    }
  });

  it("requires a cover photo before publication", () => {
    const project = { ...seedProjects[0], status: "published" as const };
    const missing = projectSchema.safeParse(project);
    assert.equal(missing.success, false);
    if (!missing.success) assert.deepEqual(missing.error.issues.map(issue => issue.path[0]), ["cover_url"]);
    assert.equal(projectSchema.safeParse({ ...project, cover_url: "https://images.example.com/finished-project.webp" }).success, true);
  });

  it("rejects malformed slugs, unsafe galleries and excessive gallery size", () => {
    const project = seedProjects[0];
    for (const slug of ["../admin", "project?published=true", "UPPERCASE", "project--name", "<script>"]) {
      assert.equal(projectSchema.safeParse({ ...project, slug }).success, false, slug);
    }
    assert.equal(projectSchema.safeParse({ ...project, images: ["javascript:alert(1)"] }).success, false);
    assert.equal(projectSchema.safeParse({ ...project, images: [""] }).success, false);
    assert.equal(projectSchema.safeParse({ ...project, images: Array(31).fill("/images/hero.jpg") }).success, false);
    assert.equal(projectSchema.safeParse({ ...project, sort_order: -1 }).success, false);
  });

  it("allows missing company contact facts but rejects invalid contact edits", () => {
    assert.equal(contactSettingsSchema.safeParse(defaultContact).success, true);
    const emptyContact = { ...Object.fromEntries(Object.keys(defaultContact).filter(key => key !== "id").map(key => [key, ""])), phones: [] };
    assert.equal(contactSettingsSchema.safeParse(emptyContact).success, true);
    assert.equal(contactSettingsSchema.safeParse({ ...defaultContact, email: "invalid-email" }).success, false);
    assert.equal(contactSettingsSchema.safeParse({ ...defaultContact, instagram: "javascript:alert(1)" }).success, false);
    assert.equal(contactSettingsSchema.safeParse({ ...defaultContact, phones: ["+995 551 39 77 66", "+995 322 00 00 00"] }).success, true);
    assert.equal(contactSettingsSchema.safeParse({ ...defaultContact, phones: Array(6).fill("+995 551 39 77 66") }).success, false);
  });
});

describe("contact inquiries", () => {
  const inquiry = {
    name: "  ნინო გიორგაძე  ",
    email: "nino@example.com",
    phone: "",
    message: "  მსურს ავეჯის ინდივიდუალური შეკვეთა.  ",
    website: "",
  };

  it("accepts Georgian input, trims prose, and permits an omitted phone", () => {
    const result = inquirySchema.parse(inquiry);
    assert.equal(result.name, "ნინო გიორგაძე");
    assert.equal(result.message, "მსურს ავეჯის ინდივიდუალური შეკვეთა.");
    assert.equal(result.phone, "");
  });

  it("rejects missing or oversized messages and invalid reply addresses", () => {
    for (const message of ["", "   ", "მოკლე", "ა".repeat(5001)]) {
      assert.equal(inquirySchema.safeParse({ ...inquiry, message }).success, false);
    }
    assert.equal(inquirySchema.safeParse({ ...inquiry, email: "not-an-email" }).success, false);
    assert.equal(inquirySchema.safeParse({ ...inquiry, name: " " }).success, false);
  });
});

describe("project page addresses", () => {
  it("romanizes Georgian titles into URL-safe addresses", () => {
    assert.equal(slugify("ხედი - სასტუმრო"), "khedi-sastumro");
    assert.equal(slugify("Holiday Inn Express - სასტუმრო"), "holiday-inn-express-sastumro");
    assert.equal(slugify("ჭაჭა & წყალი!"), "chacha-tsqali");
    assert.equal(slugify("!!!"), "project");
    assert.match(slugify("ა".repeat(200)), /^a{80}$/);
  });
  it("adds a number when the address is already taken", () => {
    assert.equal(uniqueSlug("khedi", []), "khedi");
    assert.equal(uniqueSlug("khedi", ["khedi", "khedi-2"]), "khedi-3");
  });
});
