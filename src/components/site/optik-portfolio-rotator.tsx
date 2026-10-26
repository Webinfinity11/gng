"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { ProjectCard } from "@/lib/optik-content";

export type PortfolioCardData = ProjectCard;
type RotatorText = { label: string; title: string; controls: string; previous: string; next: string };

const asset = (name: string) => `/optik/assets/${name}`;
const pad = (value: number) => String(value).padStart(2, "0");

/** One uniform card, sized like the reference layout's large card. The whole card links to the project. */
export function PortfolioCard({ project, clone = false }: { project: PortfolioCardData; clone?: boolean }) {
  return <div className={`portfolio-collection-list-wrapper gng-portfolio-card w-dyn-list${clone ? " is-clone" : ""}`} aria-hidden={clone || undefined} inert={clone || undefined}>
    <div role="list" className="portfolio-collection-list w-dyn-items"><div role="listitem" className="portfolio-collection w-dyn-item"><Link href={project.href} className="portfolio-collection-wrap gng-card-link">
      <div className="portfolio-collection-img-wrap"><img src={project.cover} loading="lazy" alt="" className="portfolio-collection-img" />{project.location && <div className="location-wrap"><img src={asset("8adb90a62f-69955392cf579f46357e268e_location.svg")} alt="" /><div className="location">{project.location}</div></div>}</div>
      <div className="portfolio-collection-text-wrap"><div className="portfolio-collection-text">{project.title}</div></div>
    </Link></div></div>
  </div>;
}

function ArrowIcon() {
  // Square-cut strokes with a detached dash, matching gng-arrow.svg and the logo.
  return <svg width="20" height="20" viewBox="6 6 16 16" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="2.2" strokeLinecap="butt" strokeLinejoin="miter"><path d="M6.5 14H9.5" /><path d="M11.5 14H20.6" /><path d="M15.6 9L20.6 14L15.6 19" /></g></svg>;
}

/** Desktop gallery: equal cards in an endless track. Clones before and after
 * the real set let the track wrap; after each scroll settles it jumps back
 * into the middle set without animation. */
export function PortfolioRotator({ cards, text }: { cards: PortfolioCardData[]; text: RotatorText }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<number | undefined>(undefined);
  const [index, setIndex] = useState(0);
  const loop = cards.length > 1;
  const count = cards.length;

  const step = () => {
    const track = trackRef.current;
    const card = track?.firstElementChild as HTMLElement | null;
    if (!track || !card) return 0;
    return card.offsetWidth + parseFloat(getComputedStyle(track).columnGap || "0");
  };
  const settle = () => {
    const track = trackRef.current;
    const size = step();
    if (!track || !size) return;
    const set = size * count;
    if (track.scrollLeft < set - size / 2) track.scrollLeft += set;
    else if (track.scrollLeft >= set * 2 - size / 2) track.scrollLeft -= set;
  };
  const onScroll = () => {
    const track = trackRef.current;
    const size = step();
    if (!track || !size) return;
    setIndex(((Math.round(track.scrollLeft / size) % count) + count) % count);
    if (!loop) return;
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(settle, 140);
  };
  const move = (direction: 1 | -1) => trackRef.current?.scrollBy({ left: direction * step(), behavior: "smooth" });

  useEffect(() => {
    const start = () => {
      const track = trackRef.current;
      if (track && loop) track.scrollLeft = step() * count;
    };
    start();
    window.addEventListener("resize", start);
    return () => { window.removeEventListener("resize", start); window.clearTimeout(settleTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const copies = loop ? [true, false, true] : [false];
  return <>
    <div className="gng-portfolio-head">
      <div className="gng-portfolio-head-left">
        <div className="section-title-wrap"><div className="section-title-cirle" /><div className="section-title">{text.label}</div></div>
        <h2 className="gng-portfolio-title">{text.title}</h2>
      </div>
      {loop && <div className="gng-portfolio-controls" role="group" aria-label={text.controls}>
        <div className="gng-portfolio-count">{pad(index + 1)} / {pad(count)}</div>
        <button type="button" className="gng-portfolio-arrow is-prev" aria-label={text.previous} onClick={() => move(-1)}><ArrowIcon /></button>
        <button type="button" className="gng-portfolio-arrow" aria-label={text.next} onClick={() => move(1)}><ArrowIcon /></button>
      </div>}
    </div>
    {count > 0 && <div ref={trackRef} className="gng-portfolio-track" onScroll={onScroll}>
      {copies.map((clone, copy) => cards.map(project => <PortfolioCard key={`${copy}-${project.slug}`} project={project} clone={clone} />))}
    </div>}
  </>;
}
