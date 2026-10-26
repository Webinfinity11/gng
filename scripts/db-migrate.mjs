import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import pg from "pg";
import { getMigrations } from "better-auth/db/migration";

if (!process.env.DATABASE_URL) {
  // `npm start` runs this first (prestart); without a database there is nothing to migrate.
  if (process.argv.includes("--if-configured")) process.exit(0);
  console.error("Set DATABASE_URL in .env.local before running migrations.");
  process.exit(1);
}
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 3, connectionTimeoutMillis: 10000 });
const client = await pool.connect();
try {
  await client.query("select pg_advisory_lock(76321419)");
  const auth = await getMigrations({ database: pool, rateLimit: { enabled: true, storage: "database" } });
  await auth.runMigrations();
  console.log("Better Auth schema ready.");
  await client.query("create table if not exists gng_migrations (name text primary key, checksum text not null, applied_at timestamptz not null default now())");
  const directory = fileURLToPath(new URL("../db/migrations/", import.meta.url));
  for (const name of (await readdir(directory)).filter(name => name.endsWith(".sql")).sort()) {
    const sql = await readFile(join(directory,name),"utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const existing = await client.query("select checksum from gng_migrations where name=$1",[name]);
    if (existing.rows.length) {
      if (existing.rows[0].checksum !== checksum) throw new Error(`Previously applied migration changed: ${name}. Create a new migration instead.`);
      continue;
    }
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("insert into gng_migrations (name,checksum) values ($1,$2)",[name,checksum]);
      await client.query("commit");
      console.log(`Applied ${name}`);
    } catch (error) { await client.query("rollback"); throw error; }
  }
  console.log("Database migrations complete.");
  // On deploy (--if-configured), fill a brand-new database once with the starting content.
  // The gng_seeded marker keeps later starts from re-adding projects an administrator deleted.
  if (process.argv.includes("--if-configured")) {
    await client.query("create table if not exists gng_seeded (seeded_at timestamptz not null default now())");
    if (!(await client.query("select 1 from gng_seeded")).rows.length) {
      const seed = spawnSync(process.execPath, ["--import", "tsx", fileURLToPath(new URL("./seed.ts", import.meta.url))], { stdio: "inherit", env: process.env });
      if (seed.status === 0) await client.query("insert into gng_seeded default values");
      else console.error("Starting content was not added; run `npm run db:seed` manually.");
    }
    // First administrator on a host without shell access: set ADMIN_EMAIL and ADMIN_PASSWORD,
    // deploy once, then remove ADMIN_PASSWORD. Ignored once any administrator exists.
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && !(await client.query("select 1 from admins limit 1")).rows.length) {
      const admin = spawnSync(process.execPath, ["--import", "tsx", fileURLToPath(new URL("./create-admin.ts", import.meta.url))], { stdio: "inherit", env: process.env });
      if (admin.status !== 0) console.error("The first administrator was not created.");
    }
  }
} catch (error) {
  console.error("Migration failed:", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
} finally {
  await client.query("select pg_advisory_unlock(76321419)").catch(() => {});
  client.release(); await pool.end();
}
