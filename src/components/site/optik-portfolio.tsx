import Link from "next/link";
import { OptikCarousel } from "./optik-carousel";
import { PortfolioCard, PortfolioRotator } from "./optik-portfolio-rotator";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { ProjectCard } from "@/lib/optik-content";

export function OptikPortfolio({ cards, lang, t, carousel }: { cards: ProjectCard[]; lang: Locale; t: Dictionary["portfolio"]; carousel: Dictionary["carousel"] }) {
  const text = { label: t.label, title: t.title, controls: t.controls, previous: t.previous, next: t.next };
  return <section className="portfolio" id="projects" aria-label={t.label}><div className="w-layout-blockcontainer container w-container"><div className="portfolio-row">
    <PortfolioRotator cards={cards} text={text} />
    {cards.length ? <OptikCarousel label={t.carouselLabel} text={carousel} slides={cards.map(project => <PortfolioCard key={project.slug} project={project} />)} compact /> : <div className="optik-empty"><h3>{t.emptyTitle}</h3><p>{t.emptyText}</p><Link href={localePath(lang, "/contact")}>{t.emptyLink}</Link></div>}
  </div></div></section>;
}
