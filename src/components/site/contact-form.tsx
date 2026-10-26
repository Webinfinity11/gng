"use client";

import { useActionState, useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { submitInquiry } from "@/lib/actions/contact";
import { initialActionState } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const emptyFields = { name: "", email: "", phone: "", message: "" };

export function ContactForm({ lang, t }: { lang: Locale; t: Dictionary["form"] }) {
  const [state, action, pending] = useActionState(submitInquiry, initialActionState);
  const [fields, setFields] = useState(emptyFields);

  useEffect(() => { if (state.success) setFields(emptyFields); }, [state]);

  const fieldProps = (name: keyof typeof emptyFields) => ({
    id: `contact-${name}`,
    name,
    value: fields[name],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFields((current) => ({ ...current, [name]: event.target.value })),
    "aria-labelledby": name === "phone" ? undefined : `contact-${name}-label`,
    "aria-invalid": !!state.errors?.[name],
    "aria-describedby": state.errors?.[name] ? `error-${name}` : undefined,
  });
  const error = (name: string) => state.errors?.[name] ? <span id={`error-${name}`} className="field-error">{state.errors[name][0]}</span> : null;

  return (
    <form action={action} className="contact-form contanct-form-wrap" aria-busy={pending}>
      <input type="hidden" name="locale" value={lang} />
      <div className="contanct-form-input-wrap gng-contact-fields">
        <div className="optik-form-field gng-contact-field">
          <label className="gng-contact-label" htmlFor="contact-name"><span id="contact-name-label">{t.name}</span> <span className="gng-contact-required" aria-hidden="true">*</span></label>
          <input {...fieldProps("name")} className="contanct-form-input w-input" required autoComplete="name" maxLength={120} placeholder={t.namePlaceholder} />
          {error("name")}
        </div>
        <div className="optik-form-field gng-contact-field">
          <label className="gng-contact-label" htmlFor="contact-email"><span id="contact-email-label">{t.email}</span> <span className="gng-contact-required" aria-hidden="true">*</span></label>
          <input {...fieldProps("email")} className="contanct-form-input w-input" type="email" required autoComplete="email" maxLength={254} placeholder={t.emailPlaceholder} />
          {error("email")}
        </div>
      </div>
      <div className="contanct-form-input-wrap gng-contact-fields">
        <div className="optik-form-field gng-contact-field">
          <label className="gng-contact-label" htmlFor="contact-phone">{t.phone} <span className="gng-contact-optional">{t.optional}</span></label>
          <input {...fieldProps("phone")} className="contanct-form-input w-input" type="tel" autoComplete="tel" maxLength={40} placeholder={t.phonePlaceholder} />
          {error("phone")}
        </div>
      </div>
      <div className="contanct-form-input-wrap gng-contact-fields">
        <div className="optik-form-field gng-contact-field">
          <label className="gng-contact-label" htmlFor="contact-message"><span id="contact-message-label">{t.message}</span> <span className="gng-contact-required" aria-hidden="true">*</span></label>
          <textarea {...fieldProps("message")} className="contanct-form-input _02 w-input" required rows={5} minLength={10} maxLength={5000} placeholder={t.messagePlaceholder} />
          {error("message")}
        </div>
      </div>
      <div className="optik-sr-only" aria-hidden="true"><label htmlFor="contact-website">{t.website}</label><input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
      {state.message && <div className={`form-feedback ${state.success ? "is-success" : "is-error"}`} role={state.success ? "status" : "alert"}>{state.success && <CheckCircle2 size={19} aria-hidden="true" />}<span>{state.message}</span></div>}
      <div className="contanct-form-btn-wrap gng-contact-actions">
        <div className="message-btn-wrap">
          <button className="message w-button gng-contact-submit" type="submit" disabled={pending}>
            <span>{pending ? t.sending : t.submit}</span>
            {pending ? <LoaderCircle className="spin" size={18} aria-hidden="true" /> : <ArrowUpRight size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </form>
  );
}
