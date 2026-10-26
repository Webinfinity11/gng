import Link from "next/link";
import type { ContactSettings } from "@/lib/types";
import { localePath, pageLabelKey, sitePages, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { BrandLogo } from "./brand-logo";
import { sitePhotos, sitePhotoProps } from "@/lib/site-media";

export function Footer({ contact, lang, t, nav }: { contact: ContactSettings; lang: Locale; t: Dictionary["footer"]; nav: Dictionary["nav"]["items"] }) {
  return <footer className="footer">
    <div className="w-layout-blockcontainer container w-container">
      <div className="footer-row">
        <div className="footer-left">
          <div className="footer-link-wrap"><div className="footer-link-title">{t.visit}</div><p className="footer-link-p">{contact.address || t.addressSoon}</p></div>
          <div className="footer-link-wrap"><div className="footer-link-title">{t.links}</div><div className="footer-link-item"><div className="footer-link-item-wrap gng-footer-links">{sitePages.map(href => <Link key={href} href={localePath(lang, href)} className="footer-link">{nav[pageLabelKey[href]]}</Link>)}</div></div></div>
        </div>
        <div className="footer-right"><div className="footer-link-item-2 _02"><Link href={localePath(lang, "/")} className="footer-logo-link w-inline-block" aria-label={`GNG - ${nav.home}`}><BrandLogo /></Link><div className="footer-link-item-wrap-2 _02">{contact.phones.map(phone => <a key={phone} href={`tel:${phone.replace(/[\s()-]/g, "")}`} className="footer-link-2 _02">{phone}</a>)}{contact.email && <a href={`mailto:${contact.email}`} className="footer-link-2 _02 email">{contact.email}</a>}{!contact.phones.length && !contact.email && <Link href={localePath(lang, "/contact")} className="footer-link-2 _02">{t.contactUs}</Link>}</div><p className="coppy">{t.rights}</p></div></div>
      </div>
      <div className="footer-img-wrap"><img {...sitePhotoProps(sitePhotos.footer, lang)} loading="lazy" sizes="(max-width: 1340px) calc(100vw - 40px), 1300px" className="footer-img" /><BrandLogo className="footer-logo" decorative /></div>
    </div>
    <div className="footer-shap" aria-hidden="true" />
  </footer>;
}
