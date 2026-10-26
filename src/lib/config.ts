export function isDatabaseConfigured() { return Boolean(process.env.DATABASE_URL); }
export function isAuthConfigured() {
  return isDatabaseConfigured() && (process.env.BETTER_AUTH_SECRET?.length ?? 0) >= 32;
}
export function isStorageConfigured() {
  return ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "R2_PUBLIC_URL"].every(key => Boolean(process.env[key]));
}
export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000";
}
