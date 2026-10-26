"use client";

import { useEffect, useRef, useState } from "react";
import "./project-gallery.css";

export type GalleryText = { label: string; region: string; photos: string; photo: string; enlarge: string; viewer: string; close: string; previous: string; next: string };

/** Bento photo grid; any photo opens a full-screen viewer with arrows. */
export function ProjectGallery({ images, title, text }: { images: string[]; title: string; text: GalleryText }) {
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const count = images.length;
  const show = (index: number) => setOpen(((index % count) + count) % count);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open !== null && !dialog.open) dialog.showModal();
    if (open === null && dialog.open) dialog.close();
  }, [open]);

  if (!count) return null;
  return <section className="gng-gallery" aria-label={text.region}>
    <div className="w-layout-blockcontainer container w-container">
      <div className="gng-gallery-head">
        <div className="section-title-wrap"><div className="section-title-cirle" /><div className="section-title">{text.label}</div></div>
        <span className="gng-gallery-total">{text.photos}</span>
      </div>
      <ul className="gng-gallery-grid">
        {images.map((src, index) => <li key={`${src}-${index}`} className="gng-gallery-item">
          <button type="button" className="gng-gallery-button" onClick={() => show(index)} aria-label={`${text.enlarge}: ${index + 1} / ${count}`}>
            <img src={src} alt={`${title} - ${text.photo} ${index + 1}`} loading={index < 3 ? "eager" : "lazy"} className="gng-gallery-img" />
          </button>
        </li>)}
      </ul>
    </div>
    <dialog
      ref={dialogRef}
      className="gng-lightbox"
      aria-label={`${title} - ${text.viewer}`}
      onClose={() => setOpen(null)}
      onClick={event => { if (event.target === event.currentTarget) setOpen(null); }}
      onKeyDown={event => {
        if (open === null) return;
        if (event.key === "ArrowLeft") show(open - 1);
        if (event.key === "ArrowRight") show(open + 1);
      }}
    >
      {open !== null && <>
        <img src={images[open]} alt={`${title} - ${text.photo} ${open + 1}`} className="gng-lightbox-img" />
        <div className="gng-lightbox-count">{open + 1} / {count}</div>
        <button type="button" className="gng-lightbox-close" onClick={() => setOpen(null)} aria-label={text.close}>×</button>
        {count > 1 && <>
          <button type="button" className="gng-lightbox-arrow is-prev" onClick={() => show(open - 1)} aria-label={text.previous}><Arrow /></button>
          <button type="button" className="gng-lightbox-arrow" onClick={() => show(open + 1)} aria-label={text.next}><Arrow /></button>
        </>}
      </>}
    </dialog>
  </section>;
}

function Arrow() {
  return <svg width="22" height="22" viewBox="6 6 16 16" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="2.2" strokeLinecap="butt" strokeLinejoin="miter"><path d="M6.5 14H9.5" /><path d="M11.5 14H20.6" /><path d="M15.6 9L20.6 14L15.6 19" /></g></svg>;
}
