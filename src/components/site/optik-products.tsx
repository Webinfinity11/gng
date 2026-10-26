import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { sitePhotos, sitePhotoProps } from "@/lib/site-media";
import { SectionLabel } from "./optik-sections";
import "./optik-products.css";

const asset = (filename: string) => `/optik/assets/${filename}`;
const arrow = "f8a17e98c9-69944edb75b9e00fcbef6899_arrow-3.svg";
const groupImages: Record<string, Parameters<typeof sitePhotoProps>[0]> = {
  furniture: sitePhotos.furniture,
  panels: sitePhotos.panels,
  doors: sitePhotos.doors,
};
const pad = (value: number) => String(value).padStart(2, "0");

/** Home page preview: one card per product group. */
export function OptikProducts({ lang, t }: { lang: Locale; t: Dictionary["products"] }) {
  return (
    <section className="gng-products">
      <div className="w-layout-blockcontainer container w-container">
        <div className="gng-products-head">
          <div className="gng-products-head-left">
            <SectionLabel>{t.label}</SectionLabel>
            <h2 className="gng-products-title">{t.homeTitle}</h2>
          </div>
          <div className="gng-products-head-right">
            <p className="gng-products-text">{t.homeText}</p>
            <Link href={`${localePath(lang, "/service")}#products`} className="gng-products-link">{t.allProducts}<img src={asset(arrow)} loading="lazy" alt="" /></Link>
          </div>
        </div>
        <ul className="gng-products-grid">
          {t.groups.map(group => (
            <li key={group.id} className="gng-product-card">
              <img {...sitePhotoProps(groupImages[group.id], lang)} loading="lazy" sizes={group.id === "furniture" ? "(max-width: 991px) calc(100vw - 40px), (max-width: 1340px) calc(33.333vw - 26.667px), 420px" : "(max-width: 767px) calc(100vw - 40px), (max-width: 991px) calc(50vw - 30px), (max-width: 1340px) calc(33.333vw - 26.667px), 420px"} className="gng-product-card-img" />
              <div className="gng-product-card-body">
                <h3 className="gng-product-card-title"><Link href={`${localePath(lang, "/service")}#${group.id}`}>{group.title}</Link></h3>
                <ul className="gng-product-card-tags">{group.products.map(product => <li key={product.title}>{product.title}</li>)}</ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Services page: the full, described catalog. */
export function ProductCatalog({ lang, t }: { lang: Locale; t: Dictionary["products"] }) {
  let number = 0;
  return (
    <section id="products" className="gng-catalog">
      <div className="w-layout-blockcontainer container w-container">
        <div className="gng-catalog-head">
          <SectionLabel>{t.label}</SectionLabel>
          <h2 className="optik-inner-title">{t.catalogTitle}</h2>
          <p className="gng-catalog-intro">{t.catalogIntro}</p>
        </div>
        {t.groups.map((group, index) => (
          <article key={group.id} id={group.id} className="gng-catalog-group">
            <div className="gng-catalog-aside">
              <div className="gng-catalog-count">{pad(index + 1)} / {pad(t.groups.length)}</div>
              <h3 className="gng-catalog-group-title">{group.title}</h3>
              <p className="gng-catalog-summary">{group.summary}</p>
              <img {...sitePhotoProps(groupImages[group.id], lang)} loading="lazy" sizes="(max-width: 991px) calc(100vw - 40px), (max-width: 1340px) calc(41.667vw - 41.667px), 517px" className="gng-catalog-img" />
            </div>
            <ol className="gng-catalog-list">
              {group.products.map(product => {
                number += 1;
                return (
                  <li key={product.title} className="gng-catalog-item">
                    <span className="gng-catalog-item-number">{pad(number)}</span>
                    <div className="gng-catalog-item-text">
                      <h4 className="gng-catalog-item-title">{product.title}</h4>
                      <p className="gng-catalog-item-description">{product.description}</p>
                    </div>
                    <Link href={localePath(lang, "/contact")} className="gng-catalog-item-link" aria-label={`${product.title} - ${t.order}`}><img src={asset(arrow)} loading="lazy" alt="" /></Link>
                  </li>
                );
              })}
            </ol>
          </article>
        ))}
      </div>
    </section>
  );
}
