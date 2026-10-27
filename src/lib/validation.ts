import { z } from "zod";

// The bundled Georgian locale still includes raw type names in a few messages.
// Keep the existing schemas and limits while presenting those errors in Georgian.
z.config({
  ...z.locales.ka(),
  customError: (issue) => {
    if (issue.code === "invalid_type") return "შეყვანილი მნიშვნელობის ტიპი არასწორია.";
    if (issue.code === "invalid_value") return "აირჩიეთ ჩამონათვალში არსებული მნიშვნელობა.";
    if (issue.code === "invalid_format" && issue.format === "uuid") return "მონაცემის იდენტიფიკატორი არასწორია.";
    if (issue.code === "too_big") {
      if (issue.origin === "string") return `ველი უნდა შეიცავდეს არაუმეტეს ${issue.maximum} სიმბოლოს.`;
      if (issue.origin === "array") return `სია უნდა შეიცავდეს არაუმეტეს ${issue.maximum} ელემენტს.`;
      return issue.inclusive ? `მნიშვნელობა არ უნდა აღემატებოდეს ${issue.maximum}-ს.` : `მნიშვნელობა უნდა იყოს ${issue.maximum}-ზე ნაკლები.`;
    }
    if (issue.code === "too_small") {
      if (issue.origin === "string") return `ველი უნდა შეიცავდეს სულ მცირე ${issue.minimum} სიმბოლოს.`;
      if (issue.origin === "array") return `სია უნდა შეიცავდეს სულ მცირე ${issue.minimum} ელემენტს.`;
      return issue.inclusive ? `მნიშვნელობა უნდა იყოს სულ მცირე ${issue.minimum}.` : `მნიშვნელობა უნდა იყოს ${issue.minimum}-ზე მეტი.`;
    }
    return undefined;
  },
});

const text = (max: number) => z.string().trim().max(max);
export function isSafeLink(value: string, allowRelative = true) {
  if (/[\u0000-\u001f\\]/.test(value)) return false;
  if (allowRelative && /^\/(?!\/)/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}
const link = text(2048).refine(v => !v || isSafeLink(v), "გამოიყენეთ საიტის შიდა მისამართი ან HTTPS ბმული.");
export const contactSettingsSchema = z.object({
  phones: z.array(text(40).min(5, "მიუთითეთ სრული ნომერი.")).max(5), email: z.union([z.literal(""), z.email().max(254)]), address: text(500),
  map_url: link, instagram: link, facebook: link, linkedin: link, address_en: text(500),
});
export const projectSchema = z.object({
  id: z.union([z.literal(""), z.uuid()]), title: text(200).min(2),
  slug: text(160).min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "გამოიყენეთ ლათინური ასოები, ციფრები და დეფისი."),
  cover_url: link, images: z.array(link.refine(Boolean)).max(30), status: z.enum(["draft", "published"]),
  featured: z.boolean(), sort_order: z.number().int().min(0).max(100000), title_en: text(200),
  category_id: z.union([z.literal(""), z.uuid()]).nullable(),
});
export const categorySchema = z.object({
  id: z.union([z.literal(""), z.uuid()]), name: text(80).min(2, "მიუთითეთ კატეგორიის სახელი."), name_en: text(80),
});
export const inquirySchema = z.object({
  name: text(120).min(2, "მიუთითეთ სახელი."), email: z.email("მიუთითეთ სწორი ელფოსტა.").max(254),
  phone: text(40), message: text(5000).min(10, "შეტყობინება უნდა შეიცავდეს სულ მცირე 10 სიმბოლოს."),
  website: text(300),
});
export function fields(formData: FormData, names: string[]) {
  return Object.fromEntries(names.map(name => [name, String(formData.get(name) ?? "")]));
}
