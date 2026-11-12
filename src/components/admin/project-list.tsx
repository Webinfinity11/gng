"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowUpDown, ArrowUpRight, CheckCircle2, FolderKanban, ImageIcon, LoaderCircle, Pencil, Search, Trash2 } from "lucide-react";
import { ProjectOrder } from "./project-order";
import { deleteProject } from "@/lib/actions/admin";
import { initialActionState, type Project, type ProjectCategory } from "@/lib/types";
import { FormFeedback } from "./form-ui";

function DeleteButton({ title }: { title: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" className="a-icon-button danger" disabled={pending} aria-label={`${title}: წაშლა`} title="პროექტის წაშლა">{pending ? <LoaderCircle size={17} className="a-spin" /> : <Trash2 size={17} />}</button>;
}

function ProjectRow({ project, category }: { project: Project; category?: ProjectCategory }) {
  const [state, action] = useActionState(deleteProject, initialActionState);
  return <li className="a-project-row"><div className="a-project-thumb">{project.cover_url ? <img src={project.cover_url} alt="" /> : <ImageIcon size={24} aria-hidden="true" />}</div><div className="a-project-copy"><Link href={`/admin/projects/${project.id}`} className="a-project-title">{project.title}</Link><p>{project.images.length ? `გალერეაში ${project.images.length} ფოტო` : "გალერეა ცარიელია"}{!project.cover_url && " · მთავარი ფოტო არ არის"}</p><div className="a-row-badges"><span className={`a-badge ${project.status === "published" ? "published" : "draft"}`}>{project.status === "published" ? "გამოქვეყნებული" : "ფოტოს გარეშე"}</span>{project.featured && <span className="a-badge featured">გამორჩეული</span>}<span className="a-badge category">{category?.name ?? "კატეგორიის გარეშე"}</span></div></div><div className="a-row-actions">{project.status === "published" && <Link href={`/projects/${project.slug}`} className="a-icon-button" aria-label={`${project.title}: საიტზე ნახვა`} title="საიტზე ნახვა" target="_blank" rel="noreferrer"><ArrowUpRight size={18} /></Link>}<Link href={`/admin/projects/${project.id}`} className="a-icon-button" aria-label={`${project.title}: რედაქტირება`} title="რედაქტირება"><Pencil size={17} /></Link><form action={action} onSubmit={(event) => { if (!window.confirm(`წაიშალოს პროექტი „${project.title}“? ამ მოქმედების გაუქმება შეუძლებელია.`)) event.preventDefault(); }}><input type="hidden" name="id" value={project.id} /><DeleteButton title={project.title} /></form></div>{state.message && <div className="a-row-feedback"><FormFeedback state={state} /></div>}</li>;
}

export function ProjectList({ projects, categories }: { projects: Project[]; categories: ProjectCategory[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [ordering, setOrdering] = useState(false);
  const [orderSaved, setOrderSaved] = useState(false);
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const filtered = projects.filter((project) => (status === "all" || project.status === status) && (categoryId === "all" || (project.category_id ?? "none") === categoryId) && `${project.title} ${project.title_en}`.toLocaleLowerCase("ka").includes(search.toLocaleLowerCase("ka")));
  if (ordering) return <ProjectOrder projects={projects} onDone={(saved) => { setOrdering(false); setOrderSaved(saved); }} />;
  return <>{orderSaved && <div className="a-feedback success" role="status"><CheckCircle2 size={19} aria-hidden="true" /><p>პროექტების რიგითობა შეინახა.</p></div>}<section className="a-panel a-list-panel"><div className="a-list-toolbar"><div className="a-search"><Search size={18} aria-hidden="true" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="პროექტის ძიება…" aria-label="პროექტის ძიება" /></div><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="სტატუსით გაფილტვრა"><option value="all">ყველა სტატუსი</option><option value="published">გამოქვეყნებული</option><option value="draft">ფოტოს გარეშე</option></select><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} aria-label="კატეგორიით გაფილტვრა"><option value="all">ყველა კატეგორია</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}<option value="none">კატეგორიის გარეშე</option></select><span className="a-result-count">{filtered.length} პროექტი</span>{projects.length > 1 && <button type="button" className="a-button secondary" onClick={() => { setOrderSaved(false); setOrdering(true); }}><ArrowUpDown size={16} aria-hidden="true" />რიგითობის შეცვლა</button>}</div>{filtered.length > 0 ? <ul className="a-project-list">{filtered.map((project) => <ProjectRow key={project.id} project={project} category={project.category_id ? categoryById.get(project.category_id) : undefined} />)}</ul> : <div className="a-empty"><FolderKanban size={32} aria-hidden="true" /><h2>{projects.length ? "პროექტი ვერ მოიძებნა" : "დაამატეთ პირველი პროექტი"}</h2><p>{projects.length ? "შეცვალეთ საძიებო სიტყვა ან ფილტრები." : "დაამატეთ სათაური და ფოტოები — პროექტი შენახვისთანავე გამოჩნდება საიტზე."}</p>{!projects.length && <Link className="a-button" href="/admin/projects/new">პროექტის დამატება</Link>}</div>}</section></>;
}
