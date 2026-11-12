"use server";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { getPool } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/config";
import { fields, inquirySchema } from "@/lib/validation";
import type { ActionState } from "@/lib/types";
import type { PoolClient } from "pg";
import { isMailConfigured, sendInquiryMail } from "@/lib/mail";
import { checkFormToken, createFormToken, isTurnstileEnabled, looksLikeSpam, verifyTurnstile } from "@/lib/spam";

const messages = {
  ka: {
    invalid: "შეამოწმეთ ფორმის ველები.",
    failed: "შეტყობინების გაგზავნა ვერ მოხერხდა.",
    inactive: "საკონტაქტო ფორმა ჯერ არ არის გააქტიურებული. გთხოვთ, მოგვიანებით სცადოთ.",
    limit: "ამ ეტაპზე შეტყობინებების ლიმიტი ამოიწურა. გთხოვთ, მოგვიანებით სცადოთ.",
    success: "თქვენი შეტყობინება მიღებულია. მადლობა, რომ დაგვიკავშირდით.",
    error: "შეტყობინების შენახვა ვერ მოხერხდა. გთხოვთ, ხელახლა სცადოთ.",
    retry: "გთხოვთ, განაახლოთ გვერდი და ხელახლა სცადოთ.",
    links: "შეტყობინებაში ბევრი ბმულია. გთხოვთ, დატოვოთ მაქსიმუმ ორი.",
    captcha: "გთხოვთ, დაადასტუროთ, რომ რობოტი არ ხართ.",
    fields: null,
  },
  en: {
    invalid: "Please check the form fields.",
    failed: "The message could not be sent.",
    inactive: "The contact form is not active yet. Please try again later.",
    limit: "The message limit has been reached for now. Please try again later.",
    success: "Your message has been received. Thank you for getting in touch.",
    error: "The message could not be saved. Please try again.",
    retry: "Please refresh the page and try again.",
    links: "The message contains too many links. Please keep it to two at most.",
    captcha: "Please confirm you are not a robot.",
    // Zod speaks Georgian site-wide; English visitors get fixed per-field hints.
    fields: {
      name: "Please enter your name.",
      email: "Please enter a valid email address.",
      phone: "Please check the phone number.",
      message: "The message must be at least 10 characters long.",
      website: "Please check this field.",
    } as Record<string, string>,
  },
};

/** Issued after the page loads in a browser; submissions without a valid, aged token are rejected. */
export async function getContactFormToken() {
  return { token: createFormToken() };
}

export async function submitInquiry(_prev: ActionState, form: FormData): Promise<ActionState> {
  const text = form.get("locale") === "en" ? messages.en : messages.ka;
  const result = inquirySchema.safeParse(fields(form,["name","email","phone","message","website"]));
  if (!result.success) {
    const errors = z.flattenError(result.error).fieldErrors;
    const localized: Record<string, string[]> = {};
    for (const [key, fieldErrors] of Object.entries(errors)) {
      if (fieldErrors) localized[key] = text.fields ? [text.fields[key] ?? text.invalid] : fieldErrors;
    }
    return { success:false,message:text.invalid,errors:localized };
  }
  // Honeypot: people never see this field. Bots get a normal-looking answer and nothing is saved or sent.
  if (result.data.website) return { success:true,message:text.success };
  if (!isDatabaseConfigured()) return { success:false,message:text.inactive };
  const d = result.data;
  const tokenCheck = checkFormToken(String(form.get("form_token") ?? ""));
  if (tokenCheck === "fast") return { success:true,message:text.success };
  if (tokenCheck !== "ok") return { success:false,message:text.retry };
  if (looksLikeSpam(d.message, d.name)) return { success:false,message:text.links };
  const incomingHeaders = await headers();
  const trustedHeader = process.env.TRUSTED_IP_HEADER;
  const ip = trustedHeader ? incomingHeaders.get(trustedHeader)?.split(",")[0]?.trim() : null;
  if (isTurnstileEnabled() && !await verifyTurnstile(String(form.get("cf-turnstile-response") ?? ""), ip)) return { success:false,message:text.captcha };
  const identity = createHash("sha256").update(ip || d.email.toLowerCase()).digest("hex");
  let client: PoolClient | undefined;
  try {
    client = await getPool().connect();
    await client.query("begin");
    // Both quotas are persistent and atomic across processes; no browser-only limiter.
    for (const [key,max] of [[`contact:${identity}`,5],["contact:global",100]] as const) {
      const { rows } = await client.query<{ count:number }>(`insert into request_limits (key,window_start,count) values ($1,date_trunc('hour',now()),1)
        on conflict (key) do update set count=case when request_limits.window_start < date_trunc('hour',now()) then 1 else request_limits.count+1 end,
        window_start=date_trunc('hour',now()) returning count`,[key]);
      if (rows[0].count > max) { await client.query("rollback"); return { success:false,message:text.limit }; }
    }
    await client.query("insert into inquiries (name,email,phone,message) values ($1,$2,$3,$4)",[d.name,d.email.toLowerCase(),d.phone,d.message]);
    await client.query("delete from request_limits where window_start < now()-interval '2 days'");
    await client.query("commit");
  } catch {
    await client?.query("rollback").catch(() => {});
    return { success:false,message:text.error };
  } finally { client?.release(); }
  // The message is also kept in the inquiries table as a backup, so a mail failure is logged, not shown.
  if (isMailConfigured()) {
    try { await sendInquiryMail({ ...d, email: d.email.toLowerCase(), locale: form.get("locale") === "en" ? "en" : "ka" }); }
    catch (error) { console.error("Inquiry email could not be sent:", error instanceof Error ? error.message : error); }
  }
  return { success:true,message:text.success };
}
