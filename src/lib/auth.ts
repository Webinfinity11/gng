import "server-only";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getPool, query } from "@/lib/db";
import { isAuthConfigured } from "@/lib/config";
import { buildAuthOptions } from "@/lib/auth-options";

function createAuth() { return betterAuth({ ...buildAuthOptions(getPool()), plugins: [nextCookies()] }); }
let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  if (!isAuthConfigured()) throw new Error("Authentication is not configured.");
  instance ??= createAuth();
  return instance;
}
export const getCurrentAdmin = cache(async () => {
  if (!isAuthConfigured()) return null;
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return null;
  const admins = await query<{ user_id: string }>("select user_id from admins where user_id = $1", [session.user.id]);
  return admins.length ? { id: session.user.id, email: session.user.email } : null;
});
export async function requireAdmin() {
  if (!isAuthConfigured()) redirect("/admin/setup");
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
