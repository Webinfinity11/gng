"use client";

import { useState } from "react";
import type { ProjectCard } from "@/lib/optik-content";
import { PortfolioCard } from "./optik-portfolio-rotator";

type Text = { filterLabel: string; filterAll: string };

/** Projects page grid with category buttons; filtering happens in the browser so the page stays static. */
export function ProjectsGrid({ cards, categories, text }: { cards: ProjectCard[]; categories: { id: string; name: string }[]; text: Text }) {
  const [active, setActive] = useState("");
  const visible = active ? cards.filter(card => card.categoryId === active) : cards;
  const options = [{ id: "", name: text.filterAll }, ...categories];
  return <>
    {categories.length > 0 && <div className="gng-projects-filter" role="group" aria-label={text.filterLabel}>
      {options.map(option => <button key={option.id || "all"} type="button" className={`gng-filter-chip${active === option.id ? " is-active" : ""}`} aria-pressed={active === option.id} onClick={() => setActive(option.id)}>{option.name}</button>)}
    </div>}
    <div className="gng-projects-grid">{visible.map(project => <PortfolioCard key={project.slug} project={project} />)}</div>
  </>;
}
