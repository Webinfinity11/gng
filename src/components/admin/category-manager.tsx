"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { LoaderCircle, Plus, Tags, Trash2 } from "lucide-react";
import { deleteCategory, saveCategory } from "@/lib/actions/admin";
import { initialActionState, type ProjectCategory } from "@/lib/types";
import { Field, FormFeedback, SaveButton } from "./form-ui";

function DeleteButton({ name }: { name: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" className="a-icon-button danger" disabled={pending} aria-label={`${name}: წაშლა`} title="კატეგორიის წაშლა">{pending ? <LoaderCircle size={17} className="a-spin" /> : <Trash2 size={17} />}</button>;
}

function CategoryRow({ category, count }: { category: ProjectCategory; count: number }) {
  const [state, action] = useActionState(saveCategory, initialActionState);
  const [deleteState, deleteAction] = useActionState(deleteCategory, initialActionState);
  const nameId = `name-${category.id}`, nameEnId = `name_en-${category.id}`;
  return <li className="a-category-row">
    <form action={action} className="a-category-edit">
      <input type="hidden" name="id" value={category.id} />
      <div className="a-field"><label htmlFor={nameId}>სახელი</label><input id={nameId} name="name" defaultValue={category.name} maxLength={80} required /></div>
      <div className="a-field"><label htmlFor={nameEnId}>ინგლისურად</label><input id={nameEnId} name="name_en" defaultValue={category.name_en} maxLength={80} lang="en" /></div>
      <span className="a-category-count">{count} პროექტი</span>
      <SaveButton label="შენახვა" />
    </form>
    <form action={deleteAction} onSubmit={(event) => { if (!window.confirm(`წაიშალოს კატეგორია „${category.name}“?${count ? ` მისი ${count} პროექტი საიტზე დარჩება, კატეგორიის გარეშე.` : ""}`)) event.preventDefault(); }}>
      <input type="hidden" name="id" value={category.id} /><DeleteButton name={category.name} />
    </form>
    {(state.message || deleteState.message) && <div className="a-row-feedback"><FormFeedback state={deleteState.message ? deleteState : state} /></div>}
  </li>;
}

function NewCategoryForm() {
  const [state, action] = useActionState(saveCategory, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.success) formRef.current?.reset(); }, [state]);
  return <section className="a-panel">
    <div className="a-panel-heading"><h2>ახალი კატეგორია</h2><p>მაგ. რესტორნები, მაღაზიები ან საცხოვრებელი სივრცეები.</p></div>
    <form ref={formRef} action={action} className="a-category-edit">
      <input type="hidden" name="id" value="" />
      <Field name="new-name" label="სახელი"><input id="new-name" name="name" maxLength={80} required placeholder="მაგ. რესტორნები" /></Field>
      <Field name="new-name_en" label="ინგლისურად"><input id="new-name_en" name="name_en" maxLength={80} lang="en" placeholder="e.g. Restaurants" /></Field>
      <AddButton />
    </form>
    <FormFeedback state={state} />
  </section>;
}

function AddButton() {
  const { pending } = useFormStatus();
  return <button className="a-button" type="submit" disabled={pending}>{pending ? <LoaderCircle size={17} className="a-spin" aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}დამატება</button>;
}

export function CategoryManager({ categories, counts }: { categories: ProjectCategory[]; counts: Record<string, number> }) {
  return <div className="a-form-stack">
    <NewCategoryForm />
    <section className="a-panel a-list-panel">
      {categories.length ? <ul className="a-category-list">{categories.map((category) => <CategoryRow key={category.id} category={category} count={counts[category.id] ?? 0} />)}</ul>
        : <div className="a-empty"><Tags size={32} aria-hidden="true" /><h2>კატეგორიები ჯერ არ არის</h2><p>დაამატეთ პირველი კატეგორია ზემოთ.</p></div>}
    </section>
  </div>;
}
