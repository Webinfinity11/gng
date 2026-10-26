"use client";

import { useFormStatus } from "react-dom";
import { CheckCircle2, CircleAlert, LoaderCircle, Save } from "lucide-react";
import type { ActionState } from "@/lib/types";

export function FormFeedback({ state }: { state: ActionState }) {
  if (!state.message && !state.errors) return null;
  const Icon = state.success ? CheckCircle2 : CircleAlert;
  return <div className={state.success ? "a-feedback success" : "a-feedback error"} role={state.success ? "status" : "alert"}>
    <Icon size={19} aria-hidden="true" /><div>{state.message && <p>{state.message}</p>}{state.errors && <ul>{Object.values(state.errors).flat().map((error, index) => <li key={index}>{error}</li>)}</ul>}</div>
  </div>;
}

export function SaveButton({ label = "ცვლილებების შენახვა", disabled = false }: { label?: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return <button className="a-button" type="submit" disabled={pending || disabled}>{pending ? <LoaderCircle size={17} className="a-spin" aria-hidden="true" /> : <Save size={17} aria-hidden="true" />}{pending ? "ინახება…" : label}</button>;
}

export function Field({ label, name, children, hint }: { label: string; name: string; children: React.ReactNode; hint?: string }) {
  return <div className="a-field"><label htmlFor={name}>{label}</label>{children}{hint && <p className="a-hint" id={`${name}-hint`}>{hint}</p>}</div>;
}
