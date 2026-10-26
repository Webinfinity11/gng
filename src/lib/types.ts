export type Hero = {
  id: number; eyebrow: string; title: string; description: string;
  image_url: string; button_label: string; button_href: string;
  title_en: string; description_en: string; button_label_en: string;
};
export type Project = {
  id: string; slug: string; title: string; summary: string; description: string;
  category: string; location: string; year: number | null; cover_url: string;
  images: string[]; status: "draft" | "published"; featured: boolean;
  sort_order: number; created_at?: string; updated_at?: string;
  title_en: string; location_en: string; category_id: string | null;
};
export type ProjectCategory = { id: string; name: string; name_en: string; sort_order: number };
export type ContactSettings = {
  /** phone is the main number (header, footer); phones lists every number, main first. */
  id: number; phone: string; phones: string[]; email: string; address: string; map_url: string;
  instagram: string; facebook: string; linkedin: string;
  address_en: string;
};
export type Inquiry = {
  id: string; name: string; email: string; phone: string; message: string;
  status: "new" | "read"; created_at: string;
};
export type ActionState = {
  success: boolean; message: string; errors?: Record<string, string[]>;
};
export const initialActionState: ActionState = { success: false, message: "" };
