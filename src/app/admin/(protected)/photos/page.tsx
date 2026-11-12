import { getPartnerLogos, getSitePhotoOverrides } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";
import { sitePhotos } from "@/lib/site-media";
import { sitePhotoSlots, type SitePhotoKey } from "@/lib/site-photo-slots";
import { SitePhotosForm } from "@/components/admin/site-photos-form";
import { PartnerLogosForm } from "@/components/admin/partner-logos-form";

export const metadata = { title: "საიტის ფოტოები" };
export default async function AdminSitePhotosPage() {
  await requireAdmin();
  const [overrides, logos] = await Promise.all([getSitePhotoOverrides(), getPartnerLogos()]);
  const defaults = Object.fromEntries(sitePhotoSlots.map(slot => [slot.key, sitePhotos[slot.key].src])) as Record<SitePhotoKey, string>;
  return <><header className="a-page-header"><div><p className="a-eyebrow">საიტის კონტენტი</p><h1>საიტის ფოტოები</h1><p className="a-subtitle">პროექტების გარდა საიტზე გამოყენებული ყველა ფოტო. თითოეულთან მითითებულია საუკეთესო ზომა.</p></div></header><SitePhotosForm overrides={overrides} defaults={defaults} /><div className="a-section-gap" /><PartnerLogosForm logos={logos} /></>;
}
