"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { categorySchema, contactSettingsSchema, fields, projectSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/types";
import { slugify, uniqueSlug } from "@/lib/slug";

function validationError(error: z.ZodError): ActionState {
  return { success: false, message: "შეამოწმეთ მონიშნული ველები.", errors: z.flattenError(error).fieldErrors };
}
function databaseError(error: unknown): ActionState {
  if (typeof error === "object" && error && "code" in error && error.code === "23503") return { success: false, message: "არჩეული კატეგორია აღარ არსებობს. განაახლეთ გვერდი." };
  if (typeof error === "object" && error && "code" in error && error.code === "23505") return { success: false, message: "ასეთი მისამართის მქონე პროექტი უკვე არსებობს. სცადეთ ხელახლა." };
  console.error("Content mutation failed.");
  return { success: false, message: "შენახვა ვერ მოხერხდა. სცადეთ ხელახლა." };
}
export async function saveContactSettings(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const phones = form.getAll("phones").map(String).filter(phone => phone.trim());
  const result = contactSettingsSchema.safeParse({ ...fields(form, ["email", "address", "map_url", "instagram", "facebook", "linkedin", "address_en"]), phones });
  if (!result.success) return validationError(result.error);
  const d = result.data;
  try {
    await query(`insert into contact_settings (id,phone,phones,email,address,map_url,instagram,facebook,linkedin,address_en) values (1,$1,$9::jsonb,$2,$3,$4,$5,$6,$7,$8)
      on conflict (id) do update set phone=$1,phones=$9::jsonb,email=$2,address=$3,map_url=$4,instagram=$5,facebook=$6,linkedin=$7,address_en=$8`, [d.phones[0] ?? "",d.email,d.address,d.map_url,d.instagram,d.facebook,d.linkedin,d.address_en,JSON.stringify(d.phones)]);
  } catch (error) { return databaseError(error); }
  revalidatePath("/", "layout");
  return { success: true, message: "საკონტაქტო მონაცემები განახლდა." };
}
export async function saveProject(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  let images: unknown;
  try { images = JSON.parse(String(form.get("images") || "[]")); }
  catch { return { success: false, message: "გალერეის მონაცემები არასწორია." }; }
  const fieldValues = fields(form, ["id", "title", "cover_url", "title_en", "category_id"]);
  // The page address comes from the title (English title first, as it reads better in a URL).
  // It is set once when the project is created, so shared links keep working after renames.
  const base = slugify(fieldValues.title_en.trim() || fieldValues.title);
  const result = projectSchema.safeParse({
    // Saving publishes: every project goes live and into the home page carousel.
    ...fieldValues, slug: base, images, status: "published", featured: true, sort_order: 0,
  });
  if (!result.success) return validationError(result.error);
  const d = result.data;
  const values = [d.title,d.title_en,d.cover_url,JSON.stringify(d.images),d.status,d.featured,d.category_id || null];
  try {
    if (d.id) {
      const rows = await query(`update projects set title=$1,title_en=$2,cover_url=$3,images=$4::jsonb,status=$5,featured=$6,category_id=$7 where id=$8 returning id`, [...values,d.id]);
      if (!rows.length) return { success: false, message: "პროექტი ვერ მოიძებნა." };
    } else {
      const taken = await query<{ slug: string }>("select slug from projects where slug = $1 or slug like $1 || '-%'", [d.slug]);
      const slug = uniqueSlug(d.slug, taken.map(row => row.slug));
      await query(`insert into projects (title,title_en,cover_url,images,status,featured,category_id,slug) values ($1,$2,$3,$4::jsonb,$5,$6,$7,$8)`, [...values, slug]);
    }
  } catch (error) { return databaseError(error); }
  revalidatePath("/", "layout");
  redirect("/admin/projects?success=saved");
}
export async function deleteProject(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = z.uuid().safeParse(form.get("id"));
  if (!id.success) return { success: false, message: "პროექტის იდენტიფიკატორი არასწორია." };
  try { await query("delete from projects where id=$1",[id.data]); }
  catch (error) { return databaseError(error); }
  revalidatePath("/", "layout");
  return { success: true, message: "პროექტი წაიშალა." };
}
export async function saveCategory(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const result = categorySchema.safeParse(fields(form, ["id", "name", "name_en"]));
  if (!result.success) return validationError(result.error);
  const d = result.data;
  try {
    if (d.id) {
      const rows = await query("update project_categories set name=$1,name_en=$2 where id=$3 returning id", [d.name,d.name_en,d.id]);
      if (!rows.length) return { success: false, message: "კატეგორია ვერ მოიძებნა." };
    } else {
      // New categories go to the end of the list.
      await query("insert into project_categories (name,name_en,sort_order) values ($1,$2,(select coalesce(max(sort_order)+1,0) from project_categories))", [d.name,d.name_en]);
    }
  } catch (error) { return databaseError(error); }
  revalidatePath("/", "layout");
  return { success: true, message: d.id ? "კატეგორია განახლდა." : "კატეგორია დაემატა." };
}
export async function deleteCategory(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = z.uuid().safeParse(form.get("id"));
  if (!id.success) return { success: false, message: "კატეგორიის იდენტიფიკატორი არასწორია." };
  // Projects in this category stay published, without a category (ON DELETE SET NULL).
  try { await query("delete from project_categories where id=$1",[id.data]); }
  catch (error) { return databaseError(error); }
  revalidatePath("/", "layout");
  return { success: true, message: "კატეგორია წაიშალა." };
}
export async function setInquiryStatus(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const result = z.object({ id:z.uuid(),status:z.enum(["new","read"]) }).safeParse(fields(form,["id","status"]));
  if (!result.success) return validationError(result.error);
  try { await query("update inquiries set status=$1 where id=$2",[result.data.status,result.data.id]); }
  catch (error) { return databaseError(error); }
  revalidatePath("/admin/inquiries"); revalidatePath("/admin");
  return { success:true,message:"სტატუსი განახლდა." };
}
