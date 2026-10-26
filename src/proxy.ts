import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, localeHeader } from "@/lib/i18n/config";

// Georgian is served from bare paths (next.config rewrites them to /ka/...); English from /en/...
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The internal Georgian prefix is never a public URL.
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  const headers = new Headers(request.headers);
  headers.set(localeHeader, pathname === "/en" || pathname.startsWith("/en/") ? "en" : defaultLocale);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Site pages only: skip Next internals, the admin, API routes and files with an extension.
  matcher: ["/((?!_next|admin|api|.*\\..*).*)"],
};
