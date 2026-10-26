import { getContactSettings } from "@/lib/data";
import { ContactSettingsForm } from "@/components/admin/contact-form";

export const metadata = { title: "კონტაქტი" };
export default async function AdminContactPage() {
  const settings = await getContactSettings();
  return <><header className="a-page-header"><div><p className="a-eyebrow">საიტის ინფორმაცია</p><h1>კონტაქტი</h1><p className="a-subtitle">განაახლეთ კომპანიის საკონტაქტო მონაცემები.</p></div></header><ContactSettingsForm settings={settings} /></>;
}
