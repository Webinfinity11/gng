"use client";
import { useEffect, useState } from "react";

const text = {
  ka: { title: "გვერდი დროებით მიუწვდომელია", body: "მონაცემების ჩატვირთვა ვერ მოხერხდა. გთხოვთ, სცადოთ ხელახლა.", retry: "ხელახლა ცდა" },
  en: { title: "This page is temporarily unavailable", body: "The content could not be loaded. Please try again.", retry: "Try again" },
};

export default function ErrorPage({ reset }: { reset: () => void }) {
  const [lang, setLang] = useState<"ka" | "en">("ka");
  useEffect(() => { if (document.documentElement.lang === "en") setLang("en"); }, []);
  const t = text[lang];
  return <main style={{ padding: "100px 24px", maxWidth: 720, margin: "auto" }}><p>GNG</p><h1>{t.title}</h1><p>{t.body}</p><button onClick={reset} style={{ padding: "12px 24px", marginTop: 24, cursor: "pointer" }}>{t.retry}</button></main>;
}
