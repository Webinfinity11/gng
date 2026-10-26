import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHero, getPublicProjects } from "@/lib/data";
import { isDatabaseConfigured } from "@/lib/config";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary, type LangParams } from "@/lib/i18n/dictionaries";
import { projectCards } from "@/lib/optik-content";
import { OptikHero } from "@/components/site/optik-hero";
import { OptikPortfolio } from "@/components/site/optik-portfolio";
import { OptikProducts } from "@/components/site/optik-products";
import { OptikPartners, OptikAbout, OptikServices } from "@/components/site/optik-sections";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? { title: { absolute: getDictionary(lang).meta.siteTitle } } : {};
}

export default async function HomePage({ params }: LangParams) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const [hero, projects] = await Promise.all([getHero(lang), getPublicProjects(lang, { featured: true })]);
  const cards = projectCards(lang, projects.slice(0, 12), !isDatabaseConfigured());
  return <>
    <OptikHero hero={hero} lang={lang} imageAlt={t.hero.imageAlt} />
    <OptikPartners t={t.partners} />
    <OptikAbout lang={lang} t={t.homeAbout} story={t.about.intro[1]} />
    <OptikPortfolio cards={cards} lang={lang} t={t.portfolio} carousel={t.carousel} />
    <OptikServices lang={lang} t={t.services} carousel={t.carousel} />
    <OptikProducts lang={lang} t={t.products} />
  </>;
}
