"use client";

import { useActionState, useRef, useState } from "react";
import { ArrowDown, ArrowUp, LoaderCircle, Plus, Trash2, Upload } from "lucide-react";
import { savePartnerLogos } from "@/lib/actions/admin";
import { initialActionState } from "@/lib/types";
import { partnerLogoLimit, type PartnerLogo } from "@/lib/partners";
import { FormFeedback, SaveButton } from "./form-ui";
import { canPreview, upload } from "./image-upload";

type Row = PartnerLogo & { key: number };

/** The carousel sizes logos by their proportions, so each one needs its real pixel size. */
function measure(url: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => image.naturalWidth && image.naturalHeight ? resolve({ width: image.naturalWidth, height: image.naturalHeight }) : reject(new Error());
    image.onerror = () => reject(new Error("ლოგოს ჩატვირთვა ვერ მოხერხდა. შეამოწმეთ ბმული."));
    image.src = url;
  });
}
/** "silk-road_logo.png" → "silk road logo" as a starting brand name. */
const nameFromFile = (file: File) => file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim().slice(0, 120);

export function PartnerLogosForm({ logos }: { logos: PartnerLogo[] }) {
  const [state, action] = useActionState(savePartnerLogos, initialActionState);
  const [rows, setRows] = useState<Row[]>(() => logos.map((logo, key) => ({ ...logo, key })));
  const [nextKey, setNextKey] = useState(logos.length);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const full = rows.length >= partnerLogoLimit;

  function append(added: PartnerLogo[]) {
    setRows(current => [...current, ...added.map((logo, index) => ({ ...logo, key: nextKey + index }))]);
    setNextKey(key => key + added.length);
  }
  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    if (rows.length + files.length > partnerLogoLimit) { setError(`კარუსელში დასაშვებია მაქსიმუმ ${partnerLogoLimit} ლოგო.`); return; }
    setError(""); setBusy(true);
    const added: PartnerLogo[] = [];
    try {
      for (const file of Array.from(files)) {
        const uploaded = await upload(file);
        added.push({ name: nameFromFile(file), url: uploaded, ...await measure(uploaded) });
      }
    } catch (err) { setError(err instanceof Error && err.message ? err.message : "ატვირთვა ვერ მოხერხდა."); }
    finally { append(added); setBusy(false); if (input.current) input.current.value = ""; }
  }
  async function addUrl() {
    const value = url.trim();
    if (!canPreview(value)) { setError("მიუთითეთ ლოგოს მოქმედი ბმული."); return; }
    setError(""); setBusy(true);
    try { append([{ name: "", url: value, ...await measure(value) }]); setUrl(""); }
    catch (err) { setError(err instanceof Error && err.message ? err.message : "ლოგოს ჩატვირთვა ვერ მოხერხდა."); }
    finally { setBusy(false); }
  }
  function move(index: number, direction: number) {
    const next = [...rows];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    setRows(next);
  }

  return <form action={action} className="a-form" onReset={(event) => event.preventDefault()}>
    <input type="hidden" name="logos" value={JSON.stringify(rows.map(({ name, url, width, height }) => ({ name, url, width, height })))} />
    <section className="a-panel">
      <div className="a-panel-heading">
        <h2>ბრენდების კარუსელი</h2>
        <p>მთავარ გვერდზე, ბანერის ქვეშ მოძრავი ლოგოები. რიგითობა ისრებით იცვლება. ყველა ლოგო კარუსელში ერთნაირ ზომაზე ჩანს.</p>
      </div>
      <p className="a-photo-size"><span>საუკეთესო ზომა:</span><strong>200 პიქსელი სიმაღლე</strong><span>(სიგანე ლოგოს მიხედვით, 200-1200 px · PNG ან WebP გამჭვირვალე ფონით · თეთრი ლოგო, რადგან ფონი მუქია)</span></p>
      {rows.length > 0 ? <ol className="a-logo-list">{rows.map((row, index) => <li key={row.key} className="a-logo-row">
        <div className="a-logo-preview">{canPreview(row.url) && <img src={row.url} alt="" />}</div>
        <input type="text" value={row.name} maxLength={120} placeholder="ბრენდის სახელი" aria-label={`ლოგო ${index + 1}: ბრენდის სახელი`} onChange={(event) => setRows(rows.map(item => item.key === row.key ? { ...item, name: event.target.value } : item))} />
        <div className="a-gallery-controls">
          <button type="button" className="a-icon-button" disabled={busy || index === 0} onClick={() => move(index, -1)} aria-label={`ლოგო ${index + 1}: წინ გადატანა`}><ArrowUp size={16} /></button>
          <button type="button" className="a-icon-button" disabled={busy || index === rows.length - 1} onClick={() => move(index, 1)} aria-label={`ლოგო ${index + 1}: უკან გადატანა`}><ArrowDown size={16} /></button>
          <button type="button" className="a-icon-button danger" disabled={busy} onClick={() => setRows(rows.filter(item => item.key !== row.key))} aria-label={`ლოგო ${index + 1}: ამოღება`}><Trash2 size={16} /></button>
        </div>
      </li>)}</ol> : <p className="a-hint">კარუსელი ცარიელია - საიტზე ეს ზოლი არ გამოჩნდება.</p>}
      <div className="a-logo-add">
        <button type="button" className="a-button secondary" disabled={busy || full} onClick={() => input.current?.click()}>{busy ? <LoaderCircle size={16} className="a-spin" aria-hidden="true" /> : <Upload size={16} aria-hidden="true" />}{busy ? "იტვირთება…" : "ლოგოების დამატება"}</button>
        <input ref={input} type="file" accept="image/png,image/webp,image/avif,image/jpeg" multiple hidden aria-label="ლოგოების არჩევა" onChange={(event) => addFiles(event.target.files)} />
        <div className="a-url-add"><input type="text" placeholder="ან ჩასვით ლოგოს ბმული" value={url} onChange={(event) => setUrl(event.target.value)} disabled={busy || full} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addUrl(); } }} /><button type="button" className="a-button secondary" onClick={addUrl} disabled={busy || full || !url.trim()} aria-label="ლოგოს ბმულის დამატება"><Plus size={18} /></button></div>
      </div>
      <p className="a-hint">მაქსიმუმ {partnerLogoLimit} ლოგო. შეგიძლიათ რამდენიმე ერთად აირჩიოთ; სახელი ფაილის სახელიდან ივსება და შეგიძლიათ შეცვალოთ.</p>
      {error && <p className="a-inline-error" role="alert">{error}</p>}
    </section>
    <FormFeedback state={state} />
    <div className="a-form-footer"><p>ცვლილებები საიტზე შენახვის შემდეგ გამოჩნდება.</p><SaveButton label="კარუსელის შენახვა" disabled={busy} /></div>
  </form>;
}
