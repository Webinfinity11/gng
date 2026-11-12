"use client";

import { useActionState, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsDown, ChevronsUp, ImageIcon } from "lucide-react";
import { reorderProjects } from "@/lib/actions/admin";
import { initialActionState, type Project } from "@/lib/types";
import { FormFeedback, SaveButton } from "./form-ui";

/** Sets the order projects appear in on the site: the first one here is shown first. */
export function ProjectOrder({ projects, onDone }: { projects: Project[]; onDone: (saved: boolean) => void }) {
  const [state, action] = useActionState(reorderProjects, initialActionState);
  const [order, setOrder] = useState(projects);
  const changed = order.some((project, index) => project.id !== projects[index]?.id);
  // Close only in response to a new save result.
  useEffect(() => { if (state.success) onDone(true); }, [state]);

  function move(from: number, to: number) {
    if (to < 0 || to >= order.length || from === to) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setOrder(next);
  }

  return <form action={action} className="a-panel a-order-panel">
    <input type="hidden" name="ids" value={JSON.stringify(order.map(project => project.id))} />
    <div className="a-panel-heading"><h2>პროექტების რიგითობა</h2><p>ზემოთ მყოფი პროექტი საიტზე პირველი გამოჩნდება - მთავარი გვერდის კარუსელშიც (პირველი 12) და პროექტების გვერდზეც. ახალი პროექტი ავტომატურად სიის თავში დაემატება.</p></div>
    <ol className="a-order-list">{order.map((project, index) => <li key={project.id} className="a-order-row">
      <span className="a-order-number">{String(index + 1).padStart(2, "0")}</span>
      <div className="a-order-thumb">{project.cover_url ? <img src={project.cover_url} alt="" /> : <ImageIcon size={18} aria-hidden="true" />}</div>
      <span className="a-order-title">{project.title}{project.status !== "published" && <small> · საიტზე არ ჩანს</small>}</span>
      <div className="a-gallery-controls">
        <button type="button" className="a-icon-button" disabled={index === 0} onClick={() => move(index, 0)} aria-label={`${project.title}: პირველზე გადატანა`} title="პირველზე გადატანა"><ChevronsUp size={16} /></button>
        <button type="button" className="a-icon-button" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={`${project.title}: ერთით ზემოთ`} title="ერთით ზემოთ"><ArrowUp size={16} /></button>
        <button type="button" className="a-icon-button" disabled={index === order.length - 1} onClick={() => move(index, index + 1)} aria-label={`${project.title}: ერთით ქვემოთ`} title="ერთით ქვემოთ"><ArrowDown size={16} /></button>
        <button type="button" className="a-icon-button" disabled={index === order.length - 1} onClick={() => move(index, order.length - 1)} aria-label={`${project.title}: ბოლოში გადატანა`} title="ბოლოში გადატანა"><ChevronsDown size={16} /></button>
      </div>
    </li>)}</ol>
    <FormFeedback state={state} />
    <div className="a-form-footer"><button type="button" className="a-button secondary" onClick={() => onDone(false)}>გაუქმება</button><SaveButton label="რიგითობის შენახვა" disabled={!changed} /></div>
  </form>;
}
