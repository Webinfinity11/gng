"use client";

import { useEffect, useState } from "react";

/** Types the hero heading in after load. The untyped rest stays in the DOM
 * (transparent) so the layout never shifts and the heading's text is whole. */
export function HeroTitle({ text }: { text: string }) {
  const [typed, setTyped] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(text.length);
      setDone(true);
      return;
    }
    setTyped(0);
    setDone(false);
    let count = 0;
    let timer = window.setTimeout(function tick() {
      count += 1;
      setTyped(count);
      if (count < text.length) timer = window.setTimeout(tick, text[count - 1] === " " ? 140 : 75);
      else timer = window.setTimeout(() => setDone(true), 1200);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [text]);

  return <h1 id="hero-title" className="hero-title" aria-label={text}>
    {text.slice(0, typed)}
    {!done && <span className="hero-title-caret" aria-hidden="true" />}
    <span className="hero-title-rest">{text.slice(typed)}</span>
  </h1>;
}
