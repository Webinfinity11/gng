"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ContactSettings } from "@/lib/types";
import { localePath, pageLabelKey, sitePages, stripLocale, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { BrandLogo } from "./brand-logo";

const asset = "/optik/assets/";

export function Header({ contact, lang, t }: { contact?: ContactSettings; lang: Locale; t: Dictionary["nav"] }) {
  // Compare locale-free paths so /about and /en/about mark the same item.
  const pathname = stripLocale(usePathname());
  const otherLang: Locale = lang === "en" ? "ka" : "en";
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => { setOpen(false); }, [pathname]);

  // The mobile menu is a full-screen panel starting just under the header bar; the page behind it stays still.
  useEffect(() => {
    if (!open) return;
    const bar = headerRef.current?.querySelector(".header-wrap");
    const setTop = () => document.documentElement.style.setProperty("--gng-menu-top", `${Math.max(0, Math.round(bar?.getBoundingClientRect().bottom ?? 0))}px`);
    setTop();
    const root = document.documentElement, overflow = root.style.overflow;
    root.style.overflow = "hidden";
    const closeOnDesktop = () => { if (window.innerWidth > 991) setOpen(false); else setTop(); };
    window.addEventListener("resize", closeOnDesktop);
    return () => { root.style.overflow = overflow; window.removeEventListener("resize", closeOnDesktop); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [open]);

  const phone = contact?.phone.trim();
  return <header ref={headerRef} className="header-section">
    <div className="w-layout-blockcontainer header-container w-container">
      <div className="header-wrap">
        <div className="navbar w-nav" data-collapse="medium">
          <div className="header-item-left"><Link href={localePath(lang, "/")} className={`header-logo-wrap w-nav-brand${pathname === "/" ? " w--current" : ""}`} aria-label={t.homeAria} onClick={() => setOpen(false)}><BrandLogo className="header-logo" eager /></Link></div>
          <nav id="optik-navigation" className="nav-menu w-nav-menu" aria-label={t.mainNavigation} data-open={open} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
            {sitePages.map((href, index) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
              return <Link key={href} href={localePath(lang, href)} className={`navigation w-nav-link${active ? " w--current" : ""}`} style={{ "--i": index } as React.CSSProperties} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}>{t.items[pageLabelKey[href]]}</Link>;
            })}
            {/* Mobile only: the header call button is hidden below the desktop layout. */}
            {phone && <div className="gng-menu-extra" style={{ "--i": sitePages.length } as React.CSSProperties}>
              <a href={`tel:${phone.replace(/[\s()-]/g, "")}`} className="gng-menu-call"><img src={`${asset}0aeed8de8b-6994132684f01f1608f544a4_9d291c9eb9df73e3bba59a7fda43bbc1_phn-icon.svg`} width={18} height={18} alt="" />{t.call}<span>{phone}</span></a>
            </div>}
          </nav>
          <button ref={toggleRef} type="button" className={`mobile-menu-btn w-nav-button${open ? " w--open" : ""}`} aria-label={open ? t.closeMenu : t.openMenu} aria-controls="optik-navigation" aria-expanded={open} onClick={() => setOpen((current) => !current)}><span className="gng-burger" aria-hidden="true"><span /><span /><span /></span></button>
          <div className="header-item-right">
            {/* A full load, not <Link>: the root layout owns <html lang> and is kept on client navigation. */}
            <a href={localePath(otherLang, pathname)} hrefLang={otherLang} lang={otherLang} className="gng-lang-switch" aria-label={t.switchAria}>{t.switchLabel}</a>
            <a href={phone ? `tel:${phone.replace(/[\s()-]/g, "")}` : undefined} role="link" aria-disabled={!phone || undefined} aria-label={phone ? `${t.call}: ${phone}` : t.call} title={phone || t.callSoon} className="header-call-button">
              <span className="header-call-icon" aria-hidden="true"><img src={`${asset}0aeed8de8b-6994132684f01f1608f544a4_9d291c9eb9df73e3bba59a7fda43bbc1_phn-icon.svg`} width={18} height={18} alt="" /></span>
              <span className="header-call-label">{t.call}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </header>;
}
