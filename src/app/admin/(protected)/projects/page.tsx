import Link from "next/link";
import { CheckCircle2, Plus } from "lucide-react";
import { getCategories, getProjects } from "@/lib/data";
import { ProjectList } from "@/components/admin/project-list";

export const metadata = { title: "პროექტები" };
export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const [projects, categories, params] = await Promise.all([getProjects({ includeDrafts: true }), getCategories(), searchParams]);
  return <><header className="a-page-header"><div><p className="a-eyebrow">პორტფოლიო</p><h1>პროექტები</h1><p className="a-subtitle">მართეთ ნამუშევრები, ფოტოები და გამოქვეყნება.</p></div><Link className="a-button" href="/admin/projects/new"><Plus size={18} aria-hidden="true" />ახალი პროექტი</Link></header>{params.success === "saved" && <div className="a-feedback success" role="status"><CheckCircle2 size={19} aria-hidden="true" /><p>პროექტი წარმატებით შეინახა.</p></div>}<ProjectList projects={projects} categories={categories} /></>;
}
