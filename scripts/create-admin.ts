import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { hashPassword } from "better-auth/crypto";
import pg from "pg";

async function readPassword(): Promise<string> {
  if (!stdin.isTTY) throw new Error("Run in an interactive terminal or supply ADMIN_PASSWORD through the process environment.");
  stdout.write("Password (at least 8 characters, hidden): ");
  stdin.setRawMode(true); stdin.resume();
  return new Promise((resolve,reject) => {
    let value = "";
    const cleanup = () => { stdin.setRawMode(false); stdin.pause(); stdin.off("data",onData); stdout.write("\n"); };
    const onData = (chunk: Buffer) => {
      for (const ch of chunk.toString()) {
        if (ch === "\u0003") { cleanup(); reject(new Error("Cancelled.")); return; }
        if (ch === "\r" || ch === "\n") { cleanup(); resolve(value); return; }
        if (ch === "\u007f" || ch === "\b") value = value.slice(0,-1);
        else if (ch >= " ") value += ch;
      }
    };
    stdin.on("data",onData);
  });
}
if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL in .env.local first.");
let email = process.env.ADMIN_EMAIL;
if (!email) {
  const prompt = createInterface({input:stdin,output:stdout});
  email = await prompt.question("Admin email: "); prompt.close();
}
email = email.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || await readPassword();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new Error("A valid email is required.");
if (password.length < 8 || password.length > 128) throw new Error("Password must be 8–128 characters.");
const hashed = await hashPassword(password);
const pool = new pg.Pool({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000});
const client = await pool.connect();
try {
  await client.query("begin");
  const existing = await client.query<{id:string}>(`select id from "user" where email=$1`,[email]);
  const reset = process.argv.includes("--reset-password");
  if (existing.rows.length && !reset) throw new Error("This user already exists. Use --reset-password for intentional password recovery.");
  const id = existing.rows[0]?.id || randomUUID();
  if (!existing.rows.length) await client.query(`insert into "user" (id,name,email,"emailVerified","createdAt","updatedAt") values ($1,'GNG Admin',$2,true,now(),now())`,[id,email]);
  if (existing.rows.length) {
    const result = await client.query(`update account set password=$1,"updatedAt"=now() where "userId"=$2 and "providerId"='credential' returning id`,[hashed,id]);
    if (!result.rows.length) throw new Error("Existing user does not have a password account.");
    await client.query(`delete from session where "userId"=$1`,[id]);
  } else await client.query(`insert into account (id,"accountId","providerId","userId",password,"createdAt","updatedAt") values ($1,$2,'credential',$2,$3,now(),now())`,[randomUUID(),id,hashed]);
  await client.query("insert into admins (user_id) values ($1) on conflict do nothing",[id]);
  await client.query("commit");
  console.log(reset ? "Admin password changed; old sessions revoked." : "Admin created. Sign in at /admin/login.");
} catch (error) { await client.query("rollback"); throw error; }
finally { client.release(); await pool.end(); }
