import "server-only";
import { cache } from "react";
import { z } from "zod";
import { query } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/config";
import { requireAdmin } from "@/lib/auth";
import { defaultContact, defaultHero } from "@/lib/seed";
import { defaultCategories } from "@/lib/categories";
import type { ContactSettings, Hero, Inquiry, Project, ProjectCategory } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";

// Public pages read the English columns on /en, falling back to Georgian when empty.
const pick = (english: boolean, en: string | undefined, ka: string) => (english && en?.trim()) || ka;
function localizeHero(hero: Hero, lang: Locale): Hero {
  const en = lang === "en";
  return { ...hero, title: pick(en, hero.title_en, hero.title), description: pick(en, hero.description_en, hero.description), button_label: pick(en, hero.button_label_en, hero.button_label) };
}
function localizeProject(project: Project, lang: Locale): Project {
  const en = lang === "en";
  return { ...project, title: pick(en, project.title_en, project.title), location: pick(en, project.location_en, project.location) };
}


/** Without a locale the Georgian copy is returned unchanged. */
export async function getHero(lang?: Locale): Promise<Hero> {
  // The hero is fixed site copy; it is not edited from the admin panel.
  const hero = defaultHero;
  return lang ? localizeHero(hero, lang) : hero;
}
const loadContactSettings = cache(async (): Promise<ContactSettings> => {
  if (!isDatabaseConfigured()) return defaultContact;
  const contact = (await query<ContactSettings>("select * from contact_settings where id = 1"))[0];
  if (!contact) return defaultContact;
  const phones = (contact.phones ?? []).filter(phone => phone.trim());
  // Rows saved before migration 004 only have the single phone column.
  return phones.length ? { ...contact, phone: phones[0], phones } : { ...contact, phones: contact.phone.trim() ? [contact.phone] : [] };
});
export async function getContactSettings(lang?: Locale): Promise<ContactSettings> {
  const contact = await loadContactSettings();
  return lang === "en" ? { ...contact, address: pick(true, contact.address_en, contact.address) } : contact;
}
export async function getPublicProjects(lang: Locale, options: { featured?: boolean } = {}): Promise<Project[]> {
  return (await getProjects(options)).map(project => localizeProject(project, lang));
}
export async function getPublicProject(slug: string, lang: Locale): Promise<Project | null> {
  const project = await getProject(slug);
  return project && localizeProject(project, lang);
}
export async function getProjects(options: { includeDrafts?: boolean; featured?: boolean } = {}): Promise<Project[]> {
  if (options.includeDrafts) await requireAdmin();
  if (!isDatabaseConfigured()) return [];
  const where: string[] = [];
  if (!options.includeDrafts) where.push("status = 'published'");
  if (options.featured) where.push("featured = true");
  return query<Project>(`select * from projects ${where.length ? `where ${where.join(" and ")}` : ""} order by sort_order asc, created_at desc`);
}
export const getProject = cache(async (slug: string): Promise<Project | null> => {
  if (!isDatabaseConfigured()) return null;
  return (await query<Project>("select * from projects where slug = $1 and status = 'published'", [slug]))[0] ?? null;
});
export async function getProjectById(id: string): Promise<Project | null> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return null;
  return (await query<Project>("select * from projects where id = $1", [id]))[0] ?? null;
}
export const getCategories = cache(async (): Promise<ProjectCategory[]> => {
  if (!isDatabaseConfigured()) return defaultCategories;
  return query<ProjectCategory>("select id, name, name_en, sort_order from project_categories order by sort_order asc, created_at asc");
});
export async function getInquiries(): Promise<Inquiry[]> {
  await requireAdmin();
  const rows = await query<Inquiry & { created_at: Date }>("select * from inquiries order by created_at desc limit 500");
  return rows.map(row => ({ ...row, created_at: new Date(row.created_at).toISOString() }));
}
