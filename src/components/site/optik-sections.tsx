import Link from "next/link";
import { OptikCarousel } from "./optik-carousel";
import { CountUp } from "./count-up";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { sitePhotoProps, type SitePhoto } from "@/lib/site-media";
import { getPartnerLogos, getSitePhotos } from "@/lib/data";
import { partnerDisplaySize } from "@/lib/partners";

const asset = (filename: string) => `/optik/assets/${filename}`;
const arrow = "f8a17e98c9-69944edb75b9e00fcbef6899_arrow-3.svg";

export function SectionLabel({ children }: { children: string }) {
  return <div className="section-title-wrap"><div className="section-title-cirle" /><div className="section-title">{children}</div></div>;
}

export async function OptikPartners({ t }: { t: Dictionary["partners"] }) {
  const logos = await getPartnerLogos();
  if (!logos.length) return null;
  return (
    <section className="patner-section" aria-label={t.title}>
      <div className="patner-container"><div className="patner-wrap">
        <div className="ticket-wrap">
          {[0, 1, 2].map(copy => <div key={copy} className="client-wrap" aria-hidden={copy > 0 ? true : undefined}>
            {logos.map((logo, index) => <img key={`${index}-${logo.url}`} src={logo.url} alt={copy > 0 ? "" : logo.name} width={logo.width} height={logo.height} decoding="async" className="client-img gng-partner-logo" style={partnerDisplaySize(logo)} />)}
          </div>)}
        </div>
      </div></div>
    </section>
  );
}

export async function OptikAbout({ lang, t, story }: { lang: Locale; t: Dictionary["homeAbout"]; story: string }) {
  const photos = await getSitePhotos();
  return (
    <section className="about gng-home-about">
      <div className="w-layout-blockcontainer container w-container"><div className="about-row">
        <div className="abou-left">
          <SectionLabel>{t.label}</SectionLabel>
          <h2 className="about-section-title">{t.title}</h2>
          <p className="abou-left-text">{story}</p>
          <Link href={localePath(lang, "/about")} className="abou-left-btn-wrap w-inline-block"><div className="abou-left-btn-text">{t.button}</div><img src={asset(arrow)} loading="lazy" alt="" /></Link>
        </div>
        <div className="abou-right">
          <div className="abou-img-wrap">
            <img {...sitePhotoProps(photos.aboutPrimary, lang)} loading="lazy" sizes="(max-width: 767px) 75vw, 30vw" className="image" />
            <img {...sitePhotoProps(photos.aboutSecondary, lang)} loading="lazy" sizes="(max-width: 767px) 50vw, 20vw" className="about-img-two" />
          </div>
          <div className="counter-wrap">
            {t.counters.map((counter, index) => <div key={counter.label} className="counter-item"><CountUp value={counter.value} className="counter-item-text" /><p className={`counter-text${index === t.counters.length - 1 ? " _02" : ""}`}>{counter.label}</p></div>)}
          </div>
        </div>
      </div></div>
    </section>
  );
}

/** Service photos in the order of the service list. */
export const serviceImageKeys = ["serviceDesign", "serviceProduction", "serviceImport", "serviceInstallation"] as const;

type ServiceItemData = Dictionary["services"]["items"][number];

function ServiceItem({ item, index, href, lang, photo, mobile = false }: { item: ServiceItemData; index: number; href: string; lang: Locale; photo: SitePhoto; mobile?: boolean }) {
  const number = <div className="service-collection-item-left-number-wrap"><div className="service-collection-item-left-number">{String(index + 1).padStart(2, "0")}</div></div>;
  const text = <div className="service-collection-item-left-text-wrap"><Link href={href} className="service-collection-item-left-title">{item.title}</Link><p className="service-collection-item-left-text">{item.description}</p></div>;
  return (
    <div role="listitem" className="service-collection-item w-dyn-item">
      <div className="service-collection-item-left">
        {mobile ? <>{number}{text}</> : <div className="service-collection-item-left-wrap">{number}{text}</div>}
        <img {...sitePhotoProps(photo, lang)} loading="lazy" sizes="(max-width: 767px) calc(100vw - 40px), 340px" className="gng-service-thumb" />
      </div>
    </div>
  );
}

export async function OptikServices({ lang, t, carousel }: { lang: Locale; t: Dictionary["services"]; carousel: Dictionary["carousel"] }) {
  const href = localePath(lang, "/service");
  const photos = await getSitePhotos();
  return (
    <section className="service gng-home-services">
      <div className="w-layout-blockcontainer container w-container"><div className="service-row">
        <div className="service-top gng-service-banner">
          <div className="service-top-left"><SectionLabel>{t.label}</SectionLabel><h2 className="service-section-title">{t.homeTitle}</h2></div>
          <img {...sitePhotoProps(photos.serviceBanner, lang)} loading="lazy" sizes="(max-width: 1340px) calc(100vw - 40px), 1300px" className="service-top-img gng-service-banner-img" />
        </div>
        <div className="service-item-wrap"><div className="service-collection w-dyn-list"><div role="list" className="service-collection-list w-dyn-items">
          {t.items.map((item, index) => <ServiceItem key={item.title} item={item} index={index} href={href} lang={lang} photo={photos[serviceImageKeys[index]]} />)}
        </div></div></div>
        <OptikCarousel compact label={t.carouselLabel} text={carousel} slides={t.items.map((item, index) => <div key={item.title} className="service-collection w-dyn-list"><div role="list" className="service-collection-list w-dyn-items"><ServiceItem item={item} index={index} href={href} lang={lang} photo={photos[serviceImageKeys[index]]} mobile /></div></div>)} />
      </div></div>
    </section>
  );
}
