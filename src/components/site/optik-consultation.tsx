import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getSitePhotos } from "@/lib/data";

const buttonArrow = "/optik/assets/18ced4326e-6998826d2628d84392340359_btn-arrow.svg";

export async function OptikConsultation({ lang, t }: { lang: Locale; t: Dictionary["cta"] }) {
  const photos = await getSitePhotos();
  return (
    <section className="cta" style={{ backgroundImage: `url("${photos.consultation.src}")` }}>
      <div className="w-layout-blockcontainer container w-container">
        <div className="cta-row">
          <h2 className="cta-title">{t.title}</h2>
          <div className="theme-button-wrap">
            <Link href={localePath(lang, "/contact")} className="btn-link-wrap color-white w-inline-block">
              <div className="btn-text-wrap-02">
                <div className="btn-text-box">
                  <div className="button-text color">{t.button}</div>
                  <div className="button-text color" aria-hidden="true">{t.button}</div>
                </div>
                <div className="btn-text-box _02" aria-hidden="true">
                  <img loading="lazy" src={buttonArrow} alt="" className="arrow" />
                  <img loading="lazy" src={buttonArrow} alt="" className="arrow" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="cta-overlay" />
    </section>
  );
}
