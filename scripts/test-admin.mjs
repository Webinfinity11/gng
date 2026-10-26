// Exercises real PostgreSQL queries, auth sessions, and UI without any cloud credentials.
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const db = await PGlite.create();
const socket = new PGLiteSocketServer({db,host:"127.0.0.1",port:54329,maxConnections:12});
await socket.start();
const email = "admin@gng-test.invalid";
const password = randomBytes(24).toString("base64url");
const env = {
  ...process.env,
  DATABASE_URL:"postgresql://postgres:postgres@127.0.0.1:54329/postgres?sslmode=disable",
  BETTER_AUTH_SECRET:randomBytes(32).toString("base64"),
  BETTER_AUTH_URL:"http://127.0.0.1:3001",NEXT_PUBLIC_SITE_URL:"http://127.0.0.1:3001",
  ADMIN_EMAIL:email,ADMIN_PASSWORD:password,
  GNG_TEST_ADMIN_EMAIL:email,GNG_TEST_ADMIN_PASSWORD:password,
  E2E_EXTERNAL_SERVER:"1",E2E_BASE_URL:"http://127.0.0.1:3001",
  R2_ACCOUNT_ID:"",R2_ACCESS_KEY_ID:"",R2_SECRET_ACCESS_KEY:"",R2_BUCKET_NAME:"",R2_PUBLIC_URL:"",
};
async function run(args) {
  const child = spawn(process.execPath,args,{env,stdio:"inherit",windowsHide:true});
  const [code] = await once(child,"exit");
  if (code !== 0) throw new Error(`Test helper failed (${args[0]}, exit ${code}).`);
}
let server;
try {
  await run(["scripts/db-migrate.mjs"]);
  await run(["--import","tsx","scripts/seed.ts"]);
  await run(["--import","tsx","scripts/create-admin.ts"]);
  server = spawn(process.execPath,["node_modules/next/dist/bin/next","start","-p","3001","--hostname","127.0.0.1"],{env,stdio:"inherit",windowsHide:true});
  let ready = false;
  for (let attempt=0;attempt<60;attempt++) {
    if (server.exitCode !== null) throw new Error("Test web server exited. Run npm run build before test:admin.");
    try { const response = await fetch("http://127.0.0.1:3001/admin/login"); if (response.ok) { ready=true;break; } } catch {}
    await new Promise(resolve=>setTimeout(resolve,500));
  }
  if (!ready) throw new Error("Test server did not become ready.");
  await run(["node_modules/@playwright/test/cli.js","test","tests/admin.spec.ts","--workers=1"]);
} catch(error) { console.error(error.message); process.exitCode=1; }
finally {
  if (server && server.exitCode===null) { server.kill(); await once(server,"exit"); }
  await socket.stop(); await db.close();
}
