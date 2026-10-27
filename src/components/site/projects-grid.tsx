"use client";

import { useState } from "react";
import type { ProjectCard } from "@/lib/optik-content";
import { PortfolioCard } from "./optik-portfolio-rotator";

type Text = { filterLabel: string; filterAll: string; showMore: string };

const FIRST_PAGE = 12;
const PAGE_STEP = 6;

/** Projects page grid with category buttons; filtering happens in the browser so the page stays static.
 * Shows the first 12 cards and adds 6 more per "show more" click, so a long list stays short. */
export function ProjectsGrid({ cards, categories, text }: { cards: ProjectCard[]; categories: { id: string; name: string }[]; text: Text }) {
  const [active, setActive] = useState("");
  const [limit, setLimit] = useState(FIRST_PAGE);
  const matching = active ? cards.filter(card => card.categoryId === active) : cards;
  const visible = matching.slice(0, limit);
  const options = [{ id: "", name: text.filterAll }, ...categories];
  const choose = (id: string) => { setActive(id); setLimit(FIRST_PAGE); };
  return <>
    {categories.length > 0 && <div className="gng-projects-filter" role="group" aria-label={text.filterLabel}>
      {options.map(option => <button key={option.id || "all"} type="button" className={`gng-filter-chip${active === option.id ? " is-active" : ""}`} aria-pressed={active === option.id} onClick={() => choose(option.id)}>{option.name}</button>)}
    </div>}
    <div className="gng-projects-grid">{visible.map(project => <PortfolioCard key={project.slug} project={project} />)}</div>
    {matching.length > limit && <div className="gng-projects-more">
      <button type="button" className="gng-filter-chip" onClick={() => setLimit(limit + PAGE_STEP)}>{text.showMore}</button>
    </div>}
  </>;
}
