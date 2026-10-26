"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** React controls replace Webflow's runtime while keeping its layout classes. */
export function OptikCarousel({
  slides,
  label,
  compact = false,
  autoplay = compact,
  text,
}: {
  slides: ReactNode[];
  label: string;
  text: Dictionary["carousel"];
  compact?: boolean;
  autoplay?: boolean;
}) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [announce, setAnnounce] = useState(false);
  const touchStart = useRef<number | null>(null);
  const maskId = useId();
  const move = (direction: number) => {
    setAnnounce(true);
    setActive(current => (current + direction + slides.length) % slides.length);
  };

  useEffect(() => {
    if (!autoplay || hovered || focused || slides.length < 2) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: number | undefined;
    const schedule = () => {
      window.clearInterval(timer);
      timer = undefined;
      if (document.visibilityState !== "visible" || motion.matches) return;
      // Match the reference's four-second compact sliders. Automatic changes
      // remain silent; user controls switch the live region back to polite.
      setAnnounce(false);
      timer = window.setInterval(() => {
        setAnnounce(false);
        setActive(current => (current + 1) % slides.length);
      }, 4000);
    };
    schedule();
    document.addEventListener("visibilitychange", schedule);
    motion.addEventListener("change", schedule);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", schedule);
      motion.removeEventListener("change", schedule);
    };
  }, [autoplay, hovered, focused, slides.length]);

  if (!slides.length) return null;

  return (
    <div
      className={`${compact ? "slider-2" : "slider"} w-slider`}
      role="region"
      aria-roledescription={text.slider}
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      onKeyDown={event => {
        if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
        if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
      }}
    >
      <div
        className={`${compact ? "mask-2" : "mask"} w-slider-mask`}
        id={maskId}
        aria-live={announce || !autoplay ? "polite" : "off"}
        aria-atomic="true"
        onTouchStart={event => { touchStart.current = event.touches[0]?.clientX ?? null; }}
        onTouchEnd={event => {
          const end = event.changedTouches[0]?.clientX;
          if (touchStart.current !== null && end !== undefined && Math.abs(end - touchStart.current) > 45) {
            move(end < touchStart.current ? 1 : -1);
          }
          touchStart.current = null;
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`${compact ? "slide-2" : "slide"} w-slide`}
            role="group"
            aria-roledescription={text.slide}
            aria-label={`${index + 1} / ${slides.length}`}
            aria-hidden={index !== active}
            inert={index !== active}
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {slide}
          </div>
        ))}
      </div>
      <button type="button" className="left-arrow w-slider-arrow-left" style={{ border: 0, padding: 0, background: "transparent" }} aria-controls={maskId} aria-label={`${label}: ${text.previous}`} onClick={() => move(-1)}>
        <img src="/optik/assets/d35247cadb-6992fa22f7a8c20d7afd8f53_91308dd43895af1d1bf6619ca98ee561_arrow-02.svg" loading="lazy" alt="" />
      </button>
      <button type="button" className="right-arrow w-slider-arrow-right" style={{ border: 0, padding: 0, background: "transparent" }} aria-controls={maskId} aria-label={`${label}: ${text.next}`} onClick={() => move(1)}>
        <img src="/optik/assets/8ea98af9c2-699687507bb45128560b96fc_testi-arrow-02.svg" loading="lazy" alt="" />
      </button>
      <div className={`${compact ? "slide-nav-2" : "slide-nav"} w-slider-nav w-round w-num`}>
        {slides.map((_, index) => (
          <button key={index} type="button" className={`w-slider-dot${index === active ? " w-active" : ""}`} aria-label={`${text.showSlide}: ${index + 1} / ${slides.length}`} aria-pressed={index === active} onClick={() => { setAnnounce(true); setActive(index); }}>{index + 1}</button>
        ))}
      </div>
    </div>
  );
}
