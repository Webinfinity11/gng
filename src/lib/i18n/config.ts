// Shared by the proxy, server components and client components.
export const locales = ["ka", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ka";
/** Request header the proxy sets so the root layout can render <html lang>. */
export const localeHeader = "x-gng-locale";

export const isLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

/** Georgian lives at the bare path; other locales get a prefix. */
export function localePath(locale: Locale, path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  if (locale === defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** Removes any locale prefix, including the internal /ka rewrite target. */
export function stripLocale(pathname: string) {
  const match = pathname.match(/^\/(ka|en)(?=\/|$)/);
  if (!match) return pathname || "/";
  return pathname.slice(match[0].length) || "/";
}

/** Public pages in navigation order, with their dictionary label keys. */
export const sitePages = ["/", "/about", "/service", "/projects", "/contact"] as const;
export const pageLabelKey = { "/": "home", "/about": "about", "/service": "service", "/projects": "projects", "/contact": "contact" } as const;
