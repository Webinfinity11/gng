"use client";

import { useId, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, LoaderCircle, Plus, Trash2, Upload } from "lucide-react";

const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const accept = acceptedTypes.join(",");

async function upload(file: File): Promise<string> {
  if (!acceptedTypes.includes(file.type)) throw new Error("აირჩიეთ JPEG, PNG, WebP ან AVIF ფორმატის ფოტო.");
  if (file.size > 5 * 1024 * 1024) throw new Error("ფოტოს ზომა არ უნდა აღემატებოდეს 5 მბ-ს.");
  const body = new FormData();
  body.append("file", file);
  const response = await fetch("/api/upload", { method: "POST", body }).catch(() => {
    throw new Error("სერვერთან დაკავშირება ვერ მოხერხდა. სცადეთ ხელახლა.");
  });
  const data = await response.json().catch(() => ({ error: "ფოტოს ატვირთვა ვერ მოხერხდა. სცადეთ ხელახლა." }));
  if (!response.ok || !data.url) throw new Error(data.error || "ფოტოს ატვირთვა ვერ მოხერხდა. სცადეთ ხელახლა.");
  return data.url;
}

function canPreview(url: string) {
  if (/[\u0000-\u001f\\]/.test(url)) return false;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password;
  } catch { return false; }
}

export function ImageUpload({ name, label, value, onChange, onBusyChange }: {
  name: string; label: string; value: string; onChange: (url: string) => void; onBusyChange?: (busy: boolean) => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file?: File) {
    if (!file) return;
    setError(""); setBusy(true); onBusyChange?.(true);
    try { onChange(await upload(file)); } catch (err) { setError(err instanceof Error ? err.message : "ატვირთვა ვერ მოხერხდა."); }
    finally { setBusy(false); onBusyChange?.(false); if (input.current) input.current.value = ""; }
  }

  return <div className="a-field a-image-field">
    <label htmlFor={id}>{label}</label>
    <div className="a-image-preview">{canPreview(value) ? <img src={value} alt={label} /> : <div className="a-image-placeholder"><ImagePlus size={30} aria-hidden="true" /><span>აირჩიეთ ფოტო</span></div>}</div>
    <div className="a-upload-actions"><button type="button" className="a-button secondary" disabled={busy} onClick={() => input.current?.click()}>{busy ? <LoaderCircle size={16} className="a-spin" aria-hidden="true" /> : <Upload size={16} aria-hidden="true" />}{busy ? "იტვირთება…" : "ფოტოს ატვირთვა"}</button>{value && <button type="button" className="a-icon-button danger" disabled={busy} onClick={() => onChange("")} aria-label={`${label}: წაშლა`}><Trash2 size={17} /></button>}</div>
    <input ref={input} type="file" accept={accept} hidden aria-label={`${label}: ფაილის არჩევა`} onChange={(event) => handleFile(event.target.files?.[0])} />
    <input id={id} name={name} type="text" value={value} onChange={(event) => onChange(event.target.value)} placeholder="ან ჩასვით ფოტოს ბმული" aria-describedby={`${id}-hint`} disabled={busy} />
    <p id={`${id}-hint`} className="a-hint">JPEG, PNG, WebP ან AVIF · მაქსიმუმ 5 მბ</p>
    {error && <p className="a-inline-error" role="alert">{error}</p>}
  </div>;
}

export function GalleryUpload({ value, onChange, onBusyChange }: { value: string[]; onChange: (urls: string[]) => void; onBusyChange?: (busy: boolean) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const id = useId();

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    if (value.length + files.length > 20) { setError("გალერეაში დასაშვებია მაქსიმუმ 20 ფოტო."); return; }
    setError(""); setBusy(true); onBusyChange?.(true);
    const next = [...value];
    try { for (const file of Array.from(files)) next.push(await upload(file)); }
    catch (err) { setError(err instanceof Error ? err.message : "ატვირთვა ვერ მოხერხდა."); }
    finally { onChange(next); setBusy(false); onBusyChange?.(false); if (input.current) input.current.value = ""; }
  }

  function addUrl() {
    const nextUrl = url.trim();
    if (!canPreview(nextUrl)) { setError("მიუთითეთ ფოტოს მოქმედი ბმული."); return; }
    if (value.length >= 20) { setError("გალერეაში დასაშვებია მაქსიმუმ 20 ფოტო."); return; }
    setError(""); onChange([...value, nextUrl]); setUrl("");
  }

  function move(index: number, direction: number) {
    const next = [...value];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next);
  }

  return <div className="a-field"><label htmlFor={id}>პროექტის გალერეა</label><input type="hidden" name="images" value={JSON.stringify(value)} />
    {value.length > 0 ? <ol className="a-gallery">{value.map((image, index) => <li key={`${index}-${image}`}><div className="a-gallery-photo">{canPreview(image) && <img src={image} alt={`გალერეის ფოტო ${index + 1}`} />}</div><span className="a-gallery-number">{String(index + 1).padStart(2, "0")}</span><div className="a-gallery-controls"><button type="button" className="a-icon-button" disabled={busy || index === 0} onClick={() => move(index, -1)} aria-label={`ფოტო ${index + 1}: წინ გადატანა`}><ArrowUp size={16} /></button><button type="button" className="a-icon-button" disabled={busy || index === value.length - 1} onClick={() => move(index, 1)} aria-label={`ფოტო ${index + 1}: უკან გადატანა`}><ArrowDown size={16} /></button><button type="button" className="a-icon-button danger" disabled={busy} onClick={() => onChange(value.filter((_, position) => position !== index))} aria-label={`ფოტო ${index + 1}: წაშლა`}><Trash2 size={16} /></button></div></li>)}</ol> : <div className="a-gallery-empty"><ImagePlus size={23} aria-hidden="true" /><p>გალერეაში ფოტოები ჯერ არ არის.</p></div>}
    <button type="button" className="a-button secondary a-upload-button" disabled={busy || value.length >= 20} onClick={() => input.current?.click()}>{busy ? <LoaderCircle size={16} className="a-spin" /> : <Upload size={16} />}{busy ? "ფოტოები იტვირთება…" : "ფოტოების დამატება"}</button><input ref={input} type="file" accept={accept} multiple hidden aria-label="გალერეის ფოტოების არჩევა" onChange={(event) => handleFiles(event.target.files)} />
    <div className="a-url-add"><input id={id} type="text" placeholder="ან ჩასვით ფოტოს ბმული" value={url} onChange={(event) => setUrl(event.target.value)} disabled={busy} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addUrl(); } }} /><button type="button" className="a-button secondary" onClick={addUrl} disabled={busy || !url.trim()} aria-label="ფოტოს ბმულის დამატება"><Plus size={18} /></button></div><p className="a-hint">მაქსიმუმ 20 ფოტო. შეცვალეთ ფოტოების რიგითობა ისრებით.</p>{error && <p className="a-inline-error" role="alert">{error}</p>}
  </div>;
}
