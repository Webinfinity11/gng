import type { Metadata } from "next";
import { ArrowDown, ArrowUpRight, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { notFound } from "next/navigation";
import { getContactSettings } from "@/lib/data";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary, type LangParams } from "@/lib/i18n/dictionaries";
import { ContactForm } from "@/components/site/contact-form";
import { BrandLogo } from "@/components/site/brand-logo";
import "./contact.css";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { meta } = getDictionary(lang);
  return { title: { absolute: meta.contact.title }, description: meta.contact.description };
}

export default async function ContactPage({ params }: LangParams) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dictionary = getDictionary(lang);
  const t = dictionary.contact;
  const contact = await getContactSettings(lang);
  const phones = contact.phones.map(phone => phone.trim()).filter(Boolean);
  const email = contact.email.trim();
  const address = contact.address.trim();
  const mailHref = `mailto:${email}`;
  const mapQuery = encodeURIComponent(address);
  const mapHref = contact.map_url || `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  // Only the fixed Google Maps origin is embedded; administrator links remain navigation links.
  const mapEmbed = `https://www.google.com/maps?q=${mapQuery}&output=embed&z=17&hl=${t.mapLanguage}`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;

  return <div className="gng-contact">
    <section className="gng-contact-section" aria-labelledby="contact-title">
      <div className="w-layout-blockcontainer container w-container">
        <div className="gng-contact-intro">
          <div>
            <div className="section-title-wrap"><span className="section-title-cirle" aria-hidden="true" /><span className="section-title">{t.label}</span></div>
            <h1 id="contact-title">{t.title}</h1>
          </div>
          <p>{t.intro}</p>
        </div>

        <div className="gng-contact-grid">
          <div className="gng-contact-direct">
            <h2>{t.direct}</h2>
            <div className="gng-contact-methods">
              {phones.map(phone => <a key={phone} className="gng-contact-method" href={`tel:${phone.replace(/[\s()-]/g, "")}`} aria-label={phone}>
                <span className="gng-contact-method-heading"><Phone size={18} aria-hidden="true" /><span>{t.call}</span><ArrowUpRight className="gng-contact-method-arrow" size={20} aria-hidden="true" /></span>
                <span className="gng-contact-value">{phone}</span>
              </a>)}
              {email && <a className="gng-contact-method" href={mailHref} aria-label={email}>
                <span className="gng-contact-method-heading"><Mail size={18} aria-hidden="true" /><span>{t.email}</span><ArrowUpRight className="gng-contact-method-arrow" size={20} aria-hidden="true" /></span>
                <span className="gng-contact-value gng-contact-email">{email}</span>
              </a>}
              {address && <a className="gng-contact-method" href="#location" aria-label={`${t.addressOnMap}: ${address}`}>
                <span className="gng-contact-method-heading"><MapPin size={18} aria-hidden="true" /><span>{t.address}</span><ArrowDown className="gng-contact-method-arrow" size={20} aria-hidden="true" /></span>
                <span className="gng-contact-value gng-contact-address">{address}</span>
              </a>}
            </div>
            <div className="gng-contact-brand"><BrandLogo decorative /></div>
          </div>

          <div className="gng-contact-form-panel" id="contact-form">
            <h2>{t.write}</h2>
            <ContactForm lang={lang} t={dictionary.form} />
          </div>
        </div>
      </div>
    </section>

    {address && <section className="gng-contact-location" id="location" aria-labelledby="location-title">
      <div className="w-layout-blockcontainer container w-container">
        <div className="gng-contact-location-heading">
          <div><div className="section-title-wrap"><span className="section-title-cirle" aria-hidden="true" /><span className="section-title">{t.locationLabel}</span></div><h2 id="location-title">{t.locationTitle}</h2></div>
          <a className="gng-contact-route" href={directionsHref} target="_blank" rel="noopener noreferrer">{t.route}<Navigation size={18} aria-hidden="true" /></a>
        </div>
        <div className="gng-contact-map">
          <iframe src={mapEmbed} title={`${t.mapTitle}: ${address}`} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
        </div>
        <a className="gng-contact-map-link" href={mapHref} target="_blank" rel="noopener noreferrer">{t.openMaps}<ArrowUpRight size={16} aria-hidden="true" /></a>
      </div>
    </section>}
  </div>;
}
