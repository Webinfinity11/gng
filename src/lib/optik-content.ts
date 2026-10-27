import { localePath, type Locale } from "@/lib/i18n/config";
import type { Project } from "@/lib/types";
import { suggestCategoryId } from "@/lib/categories";

export const optikAsset = (name: string) => `/optik/assets/${name}`;
const projectImages = (slug: string) => [1, 2, 3, 4].map(index => `/images/projects/${slug}-${String(index).padStart(2, "0")}.webp`);

// Supplied GNG project photographs shown while no database is connected.
// These entries never publish or modify the database's project drafts.
export const referenceProjects = [
  { slug: "khedi-hotel", title: { ka: "ხედი - სასტუმრო", en: "Khedi - Hotel" }, location: { ka: "ავლაბარი", en: "Avlabari" } },
  { slug: "vazisubani-estate", title: { ka: "ვაზისუბნის მამული - სასტუმრო", en: "Vazisubani Estate - Hotel" }, location: { ka: "", en: "" } },
  { slug: "holiday-inn-avlabari", title: { ka: "Holiday Inn Express - სასტუმრო", en: "Holiday Inn Express - Hotel" }, location: { ka: "ავლაბარი", en: "Avlabari" } },
  { slug: "coca-cola-bottlers-georgia", title: { ka: "კოკა კოლა ბოთლერს ჯეორჯია - სათაო ოფისი", en: "Coca-Cola Bottlers Georgia - Head Office" }, location: { ka: "", en: "" } },
].map(project => {
  const images = projectImages(project.slug);
  return { ...project, image: images[0], images };
});

export type ProjectCard = { slug: string; title: string; location?: string | null; cover: string; href: string; categoryId?: string | null };

/** Card data for the home carousel and the projects page. */
export function projectCards(lang: Locale, projects: Project[], reference: boolean): ProjectCard[] {
  if (reference) return referenceProjects.map(project => ({ slug: project.slug, title: project.title[lang], location: project.location[lang], cover: project.image, href: localePath(lang, `/portfolio/${project.slug}`), categoryId: suggestCategoryId(project.title.en) }));
  return projects.map(project => ({ slug: project.slug, title: project.title, location: project.location, cover: project.cover_url || project.images[0] || "", href: localePath(lang, `/projects/${project.slug}`), categoryId: project.category_id }));
}
