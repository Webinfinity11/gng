import { getCategories, getProjects } from "@/lib/data";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata = { title: "კატეგორიები" };
export default async function CategoriesPage() {
  const [categories, projects] = await Promise.all([getCategories(), getProjects({ includeDrafts: true })]);
  const counts: Record<string, number> = {};
  for (const project of projects) if (project.category_id) counts[project.category_id] = (counts[project.category_id] ?? 0) + 1;
  return <><header className="a-page-header"><div><p className="a-eyebrow">პორტფოლიო</p><h1>კატეგორიები</h1><p className="a-subtitle">დაამატეთ და დაარქვით სახელი პროექტების კატეგორიებს. ისინი გამოჩნდება პროექტების გვერდის ფილტრში.</p></div></header><CategoryManager categories={categories} counts={counts} /></>;
}
