"use server";
import { headers } from "next/headers";
import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { query } from "@/lib/db";
import { isAuthConfigured } from "@/lib/config";
import type { ActionState } from "@/lib/types";

export async function login(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!isAuthConfigured()) return { success: false, message: "ჯერ საჭიროა Neon-ისა და ავტორიზაციის პარამეტრების გამართვა." };
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || email.length > 254 || password.length < 8 || password.length > 128) return { success: false, message: "შეამოწმეთ ელფოსტა და პაროლი." };
  try {
    // Server API calls do not traverse Better Auth's HTTP rate limiter.
    const key = createHash("sha256").update(email).digest("hex");
    const windowStart = new Date(Math.floor(Date.now() / 900000) * 900000);
    for (const [limitKey,max] of [[`login:${key}`,10],["login:global",100]] as const) {
      const rows = await query<{ count:number }>(`insert into request_limits (key,window_start,count) values ($1,$2,1)
        on conflict (key) do update set count=case when request_limits.window_start<$2 then 1 else least(request_limits.count+1,$3+1) end,
        window_start=$2 returning count`,[limitKey,windowStart,max]);
      if (rows[0].count>max) return {success:false,message:"შესვლის მცდელობების ლიმიტი ამოიწურა. სცადეთ 15 წუთში."};
    }
    await getAuth().api.signInEmail({ body: { email, password, rememberMe: false }, headers: await headers() });
  } catch { return { success: false, message: "შესვლა ვერ მოხერხდა. შეამოწმეთ მონაცემები ან სცადეთ მოგვიანებით." }; }
  redirect("/admin");
}
export async function logout() {
  if (isAuthConfigured()) await getAuth().api.signOut({ headers: await headers() });
  redirect("/admin/login");
}
