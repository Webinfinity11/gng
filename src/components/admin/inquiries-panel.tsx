"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Inbox, LoaderCircle, Mail, MailOpen, Phone } from "lucide-react";
import { setInquiryStatus } from "@/lib/actions/admin";
import { initialActionState, type Inquiry } from "@/lib/types";
import { FormFeedback } from "./form-ui";

function StatusButton({ read }: { read: boolean }) {
  const { pending } = useFormStatus();
  return <button className="a-button secondary a-button-small" type="submit" disabled={pending}>{pending ? <LoaderCircle size={16} className="a-spin" aria-hidden="true" /> : read ? <Mail size={16} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}{read ? "მონიშვნა წაუკითხავად" : "მონიშვნა წაკითხულად"}</button>;
}

function InquiryCard({ inquiry }: { inquiry: Inquiry }) {
  const [state, action] = useActionState(setInquiryStatus, initialActionState);
  const read = inquiry.status === "read";
  const created = new Date(inquiry.created_at);
  return <article className={`a-panel a-inquiry ${read ? "is-read" : "is-new"}`}><header className="a-inquiry-header"><div className="a-inquiry-sender"><span className="a-inquiry-avatar" aria-hidden="true">{inquiry.name.charAt(0).toUpperCase()}</span><div><h2>{inquiry.name}</h2><time dateTime={inquiry.created_at}>{new Intl.DateTimeFormat("ka-GE", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tbilisi" }).format(created)}</time></div></div><span className={`a-badge ${read ? "draft" : "published"}`}>{read ? <MailOpen size={13} aria-hidden="true" /> : <Mail size={13} aria-hidden="true" />}{read ? "წაკითხული" : "ახალი"}</span></header><div className="a-inquiry-contact"><a href={`mailto:${inquiry.email}`}><Mail size={14} aria-hidden="true" />{inquiry.email}</a>{inquiry.phone && <a href={`tel:${inquiry.phone}`}><Phone size={14} aria-hidden="true" />{inquiry.phone}</a>}</div><p className="a-inquiry-message">{inquiry.message}</p><form action={action} className="a-inquiry-action"><input type="hidden" name="id" value={inquiry.id} /><input type="hidden" name="status" value={read ? "new" : "read"} /><StatusButton read={read} /><FormFeedback state={state} /></form></article>;
}

export function InquiriesPanel({ inquiries }: { inquiries: Inquiry[] }) {
  const [filter, setFilter] = useState("all");
  const filtered = inquiries.filter((inquiry) => filter === "all" || inquiry.status === filter);
  const unread = inquiries.filter((inquiry) => inquiry.status === "new").length;
  return <><div className="a-inquiry-toolbar"><div className="a-tabs" role="group" aria-label="შეტყობინებების გაფილტვრა">{[{ id: "all", label: "ყველა", count: inquiries.length }, { id: "new", label: "ახალი", count: unread }, { id: "read", label: "წაკითხული", count: inquiries.length - unread }].map((tab) => <button type="button" key={tab.id} aria-pressed={filter === tab.id} className={filter === tab.id ? "active" : ""} onClick={() => setFilter(tab.id)}>{tab.label}<span>{tab.count}</span></button>)}</div></div>{filtered.length ? <div className="a-inquiries-list">{filtered.map((inquiry) => <InquiryCard key={inquiry.id} inquiry={inquiry} />)}</div> : <div className="a-panel a-empty"><Inbox size={34} aria-hidden="true" /><h2>შეტყობინებები არ არის</h2><p>{filter === "all" ? "კონტაქტის ფორმიდან მიღებული მიმართვები აქ გამოჩნდება." : "ამ კატეგორიაში შეტყობინებები ჯერ არ არის."}</p></div>}</>;
}
