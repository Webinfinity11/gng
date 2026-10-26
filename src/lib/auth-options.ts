import type { BetterAuthOptions } from "better-auth";
import type { Pool } from "pg";

export function buildAuthOptions(database: Pool): BetterAuthOptions {
  return {
    appName: "GNG",
    database,
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 8 },
    session: { expiresIn: 60 * 60 * 12, updateAge: 60 * 30 },
    rateLimit: { enabled: true, storage: "database", window: 60, max: 30 },
    advanced: { defaultCookieAttributes: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" } },
  };
}
