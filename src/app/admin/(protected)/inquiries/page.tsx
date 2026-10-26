import { getInquiries } from "@/lib/data";
import { InquiriesPanel } from "@/components/admin/inquiries-panel";

export const metadata = { title: "შეტყობინებები" };
export default async function InquiriesPage() {
  const inquiries = await getInquiries();
  return <><header className="a-page-header"><div><p className="a-eyebrow">კომუნიკაცია</p><h1>შეტყობინებები</h1><p className="a-subtitle">კონტაქტის ფორმიდან მიღებული მიმართვები.</p></div></header><InquiriesPanel inquiries={inquiries} /></>;
}
