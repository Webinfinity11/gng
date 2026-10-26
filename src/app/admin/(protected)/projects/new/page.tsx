import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCategories } from "@/lib/data";
import { ProjectForm } from "@/components/admin/project-form";

export const metadata = { title: "ახალი პროექტი" };
export default async function NewProjectPage() {
  const categories = await getCategories();
  return <><Link className="a-back-link a-top-back" href="/admin/projects"><ArrowLeft size={16} aria-hidden="true" />პროექტები</Link><header className="a-page-header"><div><p className="a-eyebrow">პორტფოლიო</p><h1>ახალი პროექტი</h1><p className="a-subtitle">დაამატეთ სათაური, მთავარი ფოტო და გალერეა. შენახვისთანავე პროექტი საიტზე გამოჩნდება.</p></div></header><ProjectForm categories={categories} /></>;
}
