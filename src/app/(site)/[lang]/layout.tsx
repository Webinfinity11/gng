import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { getContactSettings } from "@/lib/data";
import { isLocale, locales, localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import "../../optik-reference.css";
import "../../../../public/optik/assets/fonts.css";
import "../../optik.css";
import "@/components/site/optik-shell.css";
import "../optik-inner.css";
import "../../georgian.css";

export const dynamic = "force-dynamic";

type Props = { children: React.ReactNode; params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: { default: t.meta.siteTitle, template: "%s · GNG" },
    description: t.meta.siteDescription,
    openGraph: { type: "website", locale: t.meta.ogLocale, siteName: "GNG" },
    alternates: { languages: Object.fromEntries(locales.map(locale => [locale, localePath(locale, "/")])) },
  };
}

export default async function SiteLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const contact = await getContactSettings(lang);
  return <div className="optik-site page-wrapper" lang={lang}><a className="skip-link" href="#main-content">{t.nav.skipLink}</a><Header contact={contact} lang={lang} t={t.nav} /><main id="main-content">{children}</main><Footer contact={contact} lang={lang} t={t.footer} nav={t.nav.items} /></div>;
}
