import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, localePath } from "@/lib/i18n/config";
import { getDictionary, type LangParams } from "@/lib/i18n/dictionaries";
import { sitePhotos, sitePhotoProps } from "@/lib/site-media";
import "./about.css";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return { title: { absolute: t.meta.about.title }, description: t.about.intro[0] };
}

const asset = (name: string) => `/optik/assets/${name}`;
const arrow = asset("gng-arrow.svg");

function ContactButton({ href, label }: { href: string; label: string }) {
  return <div className="theme-button-wrap">
    <Link href={href} className="btn-link-wrap color w-inline-block">
      <div className="btn-text-wrap-02">
        <div className="btn-text-box"><div className="button-text">{label}</div><div className="button-text" aria-hidden="true">{label}</div></div>
        <div className="btn-text-box _02" aria-hidden="true"><img src={arrow} alt="" className="arrow" /><img src={arrow} alt="" className="arrow" /></div>
      </div>
    </Link>
  </div>;
}

export default async function AboutPage({ params }: LangParams) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const aboutContent = getDictionary(lang).about;
  const contactButton = <ContactButton href={localePath(lang, "/contact")} label={aboutContent.contactButton} />;
  return <div className="gng-about">
    <section className="gng-about-intro" aria-labelledby="about-title">
      <div className="w-layout-blockcontainer container w-container">
        <div className="gng-about-intro-grid">
          <div className="gng-about-intro-copy">
            <div className="section-title-wrap"><span className="section-title-cirle" aria-hidden="true" /><span className="section-title">GNG</span></div>
            <h1 id="about-title">{aboutContent.title}</h1>
            <p className="gng-about-lead">{aboutContent.intro[0]}</p>
            {contactButton}
          </div>
          <figure className="gng-about-photo">
            <img {...sitePhotoProps(sitePhotos.aboutIntro, lang)} fetchPriority="high" sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1400px) 46vw, 620px" />
          </figure>
        </div>
        <div className="gng-about-story">
          <span className="gng-about-year" aria-hidden="true">2015</span>
          <p>{aboutContent.intro[1]}</p>
        </div>
      </div>
    </section>

    <section className="gng-about-strengths gng-about-section" aria-labelledby="about-strengths-title">
      <div className="w-layout-blockcontainer container w-container">
        <h2 id="about-strengths-title" className="gng-about-heading">{aboutContent.strengthsTitle}</h2>
        <div className="gng-about-strengths-grid">
          {aboutContent.strengths.map(item => <article className="gng-about-strength" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.paragraph}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section className="gng-about-materials gng-about-section" aria-labelledby="about-materials-title">
      <div className="w-layout-blockcontainer container w-container">
        <div className="gng-about-materials-heading">
          <h2 id="about-materials-title" className="gng-about-heading">{aboutContent.materials.title}</h2>
          <p>{aboutContent.materials.intro}</p>
        </div>
        <dl className="gng-about-materials-list">
          {aboutContent.materials.items.map((item, index) => <div className="gng-about-material" key={item.name}>
            <dt><span className="gng-about-material-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><span>{item.name}</span></dt>
            <dd>{item.list}</dd>
          </div>)}
        </dl>
      </div>
    </section>

    <section className="gng-about-quality gng-about-section" aria-labelledby="about-quality-title">
      <div className="w-layout-blockcontainer container w-container">
        <div className="gng-about-quality-grid">
          <figure className="gng-about-photo">
            <img {...sitePhotoProps(sitePhotos.aboutQuality, lang)} loading="lazy" sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1400px) 40vw, 520px" />
          </figure>
          <div className="gng-about-quality-copy">
            <h2 id="about-quality-title" className="gng-about-heading">{aboutContent.quality.title}</h2>
            {aboutContent.quality.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
      </div>
    </section>

    <section className="gng-about-audience gng-about-section" aria-labelledby="about-audience-title">
      <div className="w-layout-blockcontainer container w-container">
        <div className="gng-about-audience-grid">
          <h2 id="about-audience-title" className="gng-about-heading">{aboutContent.audience.title}</h2>
          <div className="gng-about-audience-copy">
            {aboutContent.audience.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            {contactButton}
          </div>
        </div>
      </div>
    </section>
  </div>;
}
