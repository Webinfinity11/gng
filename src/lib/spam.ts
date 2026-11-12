import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Contact-form spam checks that need no visitor interaction:
 * - a form token the browser fetches after the page loads (bots that only POST never have one),
 *   signed with the server secret and carrying the time the form was opened;
 * - a minimum fill time (people take longer than a few seconds) and a maximum age;
 * - message content typical of spam (many links, link markup).
 * Optional Cloudflare Turnstile is verified when TURNSTILE_SECRET_KEY is set.
 */
const MIN_FILL_MS = 3_000;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

function secret() {
  return process.env.BETTER_AUTH_SECRET || "gng-dev-form-secret";
}
function sign(value: string) {
  return createHmac("sha256", secret()).update(`contact-form:${value}`).digest("base64url");
}
export function createFormToken(now = Date.now()) {
  return `${now}.${sign(String(now))}`;
}
export function checkFormToken(token: string, now = Date.now()): "ok" | "missing" | "fast" | "expired" {
  const [issued, signature] = token.split(".");
  if (!issued || !signature || !/^\d{10,16}$/.test(issued)) return "missing";
  const expected = Buffer.from(sign(issued));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return "missing";
  const age = now - Number(issued);
  if (age < MIN_FILL_MS) return "fast";
  if (age > MAX_AGE_MS) return "expired";
  return "ok";
}

export function looksLikeSpam(message: string, name: string) {
  const links = message.match(/https?:\/\/|www\./gi)?.length ?? 0;
  if (links > 2) return true;
  if (/\[url=|<a\s+href|\[link=/i.test(message)) return true;
  if (/https?:\/\/|www\./i.test(name)) return true;
  return false;
}

export function isTurnstileEnabled() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}
export async function verifyTurnstile(token: string, ip?: string | null) {
  if (!token) return false;
  const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, signal: AbortSignal.timeout(8_000) });
    const data = await response.json() as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
