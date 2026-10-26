import "server-only";
import { Pool, type QueryResultRow } from "pg";

const globalDb = globalThis as unknown as { gngPool?: Pool };
export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  if (!globalDb.gngPool) {
    globalDb.gngPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5, idleTimeoutMillis: 20000, connectionTimeoutMillis: 10000,
    });
    globalDb.gngPool.on("error", () => console.error("Database connection interrupted."));
  }
  return globalDb.gngPool;
}
export async function query<T extends QueryResultRow>(sql: string, values: unknown[] = []) {
  return (await getPool().query<T>(sql, values)).rows;
}
