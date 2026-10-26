import Link from "next/link";
import type { Hero } from "@/lib/types";
import { optikAsset } from "@/lib/optik-content";
import { HeroTitle } from "./hero-title";
import { localePath, type Locale } from "@/lib/i18n/config";
import { sitePhotos, sitePhotoProps } from "@/lib/site-media";

export function OptikHero({ hero, lang, imageAlt }: { hero: Hero; lang: Locale; imageAlt: string }) {
  const defaultPhoto = hero.image_url === sitePhotos.hero.src ? sitePhotoProps(sitePhotos.hero, lang) : undefined;
  return <section className="hero custom-hero" aria-labelledby="hero-title">
    <div className="w-layout-blockcontainer container w-container"><div className="hero-row">
      <div className="hero-content">
      {hero.eyebrow && <p className="optik-hero-eyebrow">{hero.eyebrow}</p>}
      <div className="hero-title-wrap"><HeroTitle text={hero.title} /><noscript><style>{".optik-site .hero-title-rest{visibility:visible}"}</style></noscript></div>
      <div className="hero-copy-block"><p className="hero-text">{hero.description}</p></div>
      <div className="hero-btn-wrap"><div className="theme-button-wrap"><Link href={localePath(lang, hero.button_href || "/projects")} className="btn-link-wrap color w-inline-block"><div className="btn-text-wrap-02">
        <div className="btn-text-box"><div className="button-text">{hero.button_label}</div><div className="button-text" aria-hidden="true">{hero.button_label}</div></div>
        <div className="btn-text-box _02">{[0, 1].map(i => <img key={i} src={optikAsset("gng-arrow.svg")} alt="" className="arrow" />)}</div>
      </div></Link></div></div>
      </div>
      <div className="hero-visual">
        <img className={`hero-img${defaultPhoto ? " hero-art" : ""}`} src={hero.image_url} alt={defaultPhoto?.alt ?? imageAlt} srcSet={defaultPhoto?.srcSet} width={defaultPhoto?.width} height={defaultPhoto?.height} sizes="(max-width: 719px) calc(100vw - 40px), (max-width: 991px) 680px, (max-width: 1491px) 64vw, 913px" fetchPriority="high" />
      </div>
    </div></div>
  </section>;
}
