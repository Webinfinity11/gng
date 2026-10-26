import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OptikConsultation } from "@/components/site/optik-consultation";
import { ProductCatalog } from "@/components/site/optik-products";
import { SectionLabel } from "@/components/site/optik-sections";
import { isLocale, localePath } from "@/lib/i18n/config";
import { getDictionary, type LangParams } from "@/lib/i18n/dictionaries";
import { sitePhotos, sitePhotoProps } from "@/lib/site-media";
import "../../optik-inner.css";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { meta } = getDictionary(lang);
  return { title: { absolute: meta.services.title }, description: meta.services.description };
}

const serviceImages = [
  sitePhotos.serviceDesign,
  sitePhotos.serviceProduction,
  sitePhotos.serviceImport,
  sitePhotos.serviceInstallation,
];

export default async function ServicesPage({ params }: LangParams) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const services = t.services.items.map((item, index) => ({ ...item, image: serviceImages[index] }));
  return (
    <>
      <section className="service optik-inner-services">
        <div className="w-layout-blockcontainer container w-container">
          <div className="gng-section-head"><SectionLabel>{t.services.label}</SectionLabel><h1 className="optik-inner-title">{t.services.pageTitle}</h1></div>
          <div className="service-row">
            <div className="service-item-wrap _02">
              <div className="service-collection w-dyn-list">
                <div role="list" className="service-collection-list w-dyn-items">
                  {services.map((service, index) => (
                    <div key={service.title} role="listitem" className="service-collection-item w-dyn-item">
                      <div className="service-collection-item-left _02">
                        <div className="service-collection-item-left-number-wrap"><div className="service-collection-item-left-number">{String(index + 1).padStart(2, "0")}</div></div>
                        <div className="service-collection-item-left-text-wrap"><Link href={localePath(lang, "/contact")} className="service-collection-item-left-title">{service.title}</Link><p className="service-collection-item-left-text">{service.description}</p></div>
                        <div className="service-collection-item-left-tag-wrap">{service.tags.map(tag => <div key={tag} className="service-collection-item-left-tag">{tag}</div>)}</div>
                      </div>
                      <div className="service-collection-item-img-wrap _02"><img {...sitePhotoProps(service.image, lang)} loading="lazy" sizes="(max-width: 767px) 100vw, (max-width: 991px) 727px, 939px" className="service-collection-item-img" /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ProductCatalog lang={lang} t={t.products} />
      <OptikConsultation lang={lang} t={t.cta} />
    </>
  );
}
