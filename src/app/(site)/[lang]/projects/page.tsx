import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getPublicProjects } from "@/lib/data";
import { categoryName } from "@/lib/categories";
import { isDatabaseConfigured } from "@/lib/config";
import { isLocale, localePath } from "@/lib/i18n/config";
import { getDictionary, type LangParams } from "@/lib/i18n/dictionaries";
import { projectCards } from "@/lib/optik-content";
import { OptikConsultation } from "@/components/site/optik-consultation";
import { ProjectsGrid } from "@/components/site/projects-grid";
import { SectionLabel } from "@/components/site/optik-sections";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { meta } = getDictionary(lang);
  return { title: { absolute: meta.projects.title }, description: meta.projects.description };
}

export default async function ProjectsPage({ params }: LangParams) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const reference = !isDatabaseConfigured();
  const [projects, allCategories] = await Promise.all([reference ? [] : getPublicProjects(lang), getCategories()]);
  const cards = projectCards(lang, projects, reference);
  // Only categories that have a published project become filter buttons.
  const categories = allCategories.filter(category => cards.some(card => card.categoryId === category.id)).map(category => ({ id: category.id, name: categoryName(category, lang) }));
  return <>
    <section className="gng-projects-page">
      <div className="w-layout-blockcontainer container w-container">
        <div className="gng-projects-head">
          <div className="gng-projects-head-left">
            <SectionLabel>{t.portfolio.label}</SectionLabel>
            <h1 className="optik-inner-title">{t.portfolio.pageTitle}</h1>
          </div>
          <p className="gng-projects-intro">{t.portfolio.pageIntro}</p>
        </div>
        {cards.length ? <ProjectsGrid cards={cards} categories={categories} text={{ filterLabel: t.portfolio.filterLabel, filterAll: t.portfolio.filterAll, showMore: t.portfolio.showMore }} />
          : <div className="optik-empty"><h3>{t.portfolio.emptyTitle}</h3><p>{t.portfolio.emptyText}</p><Link href={localePath(lang, "/contact")}>{t.portfolio.emptyLink}</Link></div>}
      </div>
    </section>
    <OptikConsultation lang={lang} t={t.cta} />
  </>;
}
