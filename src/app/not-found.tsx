import Link from "next/link";
import { headers } from "next/headers";
import { defaultLocale, isLocale, localeHeader, localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function NotFound() {
  const requested = (await headers()).get(localeHeader) ?? defaultLocale;
  const lang = isLocale(requested) ? requested : defaultLocale;
  const t = getDictionary(lang).notFound;
  return <main style={{ padding: "100px 24px", maxWidth: 720, margin: "auto" }}><p>GNG / 404</p><h1>{t.title}</h1><p>{t.text}</p><Link href={localePath(lang, "/")} style={{ display: "inline-block", marginTop: 24 }}>{t.back}</Link></main>;
}
