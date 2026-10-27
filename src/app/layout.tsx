import type { Metadata } from "next";
import "@fontsource/noto-sans-georgian/400.css";
import "@fontsource/noto-sans-georgian/500.css";
import "@fontsource/noto-sans-georgian/600.css";
import "@fontsource/noto-sans-georgian/700.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/800.css";
import "./globals.css";
import { headers } from "next/headers";
import { siteUrl } from "@/lib/config";
import { defaultLocale, isLocale, localeHeader } from "@/lib/i18n/config";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "GNG - ავეჯი თქვენი სივრცისთვის", template: "%s · GNG" },
  description: "ავეჯის დიზაინი, დამზადება და ინდივიდუალური გადაწყვეტილებები კერძო და კომერციული სივრცეებისთვის. GNG - 2015 წლიდან.",
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
  openGraph: { type: "website", locale: "ka_GE", siteName: "GNG" },
};
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // The proxy marks site requests with their locale; the admin stays Georgian.
  const requested = (await headers()).get(localeHeader) ?? defaultLocale;
  const lang = isLocale(requested) ? requested : defaultLocale;
  return (
    <html lang={lang} data-scroll-behavior="smooth">
      {/* Extensions can add body attributes such as cz-shortcut-listen before
          hydration. Tolerate body-level differences only; descendants still warn. */}
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
