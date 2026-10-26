import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getCategories, getProjectById } from "@/lib/data";
import { ProjectForm } from "@/components/admin/project-form";

export const metadata = { title: "პროექტის რედაქტირება" };
export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, categories] = await Promise.all([getProjectById(id), getCategories()]);
  if (!project) notFound();
  return <><Link className="a-back-link a-top-back" href="/admin/projects"><ArrowLeft size={16} aria-hidden="true" />პროექტები</Link><header className="a-page-header"><div><p className="a-eyebrow">რედაქტირება</p><h1>{project.title}</h1><p className="a-subtitle">განაახლეთ პროექტის ინფორმაცია და ვიზუალური მასალა.</p></div>{project.status === "published" && <Link className="a-button secondary" href={`/projects/${project.slug}`} target="_blank" rel="noreferrer">საიტზე ნახვა<ArrowUpRight size={17} aria-hidden="true" /></Link>}</header><ProjectForm project={project} categories={categories} /></>;
}
