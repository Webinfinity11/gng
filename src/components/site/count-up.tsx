"use client";

import { useEffect, useRef, useState } from "react";

/** Counts from 1 to `value` the first time it scrolls into view. */
export function CountUp({ value, duration = 1800, className }: { value: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(value);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setCurrent(1);
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCurrent(Math.max(1, Math.round(1 + (value - 1) * eased)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    observer.observe(element);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [value, duration]);

  // The final value stays in the accessible name while the digits animate.
  return <div ref={ref} className={className}><span className="optik-sr-only">{value}</span><span aria-hidden="true">{current}</span></div>;
}
