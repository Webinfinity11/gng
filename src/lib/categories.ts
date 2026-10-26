import type { Locale } from "@/lib/i18n/config";
import type { ProjectCategory } from "@/lib/types";

// The starting categories; migration 005 inserts the same ids. Shown as-is while no database is connected.
export const defaultCategories: ProjectCategory[] = [
  { id: "5c47e000-0000-4000-8000-000000000001", name: "სასტუმროები", name_en: "Hotels", sort_order: 0 },
  { id: "5c47e000-0000-4000-8000-000000000002", name: "ოფისები", name_en: "Offices", sort_order: 1 },
  { id: "5c47e000-0000-4000-8000-000000000003", name: "კერძო შეკვეთა", name_en: "Private order", sort_order: 2 },
  { id: "5c47e000-0000-4000-8000-000000000004", name: "საჯარო სივრცეები", name_en: "Public places", sort_order: 3 },
];
const [hotels, offices] = defaultCategories;

/** Starting projects are filed by their English title; the rest are left for the administrator. */
export function suggestCategoryId(titleEn: string): string | null {
  if (/hotel|marriott|moxy|radisson|holiday inn|best western/i.test(titleEn)) return hotels.id;
  if (/office/i.test(titleEn)) return offices.id;
  return null;
}

export const categoryName = (category: ProjectCategory, lang: Locale) => (lang === "en" && category.name_en.trim()) || category.name;
