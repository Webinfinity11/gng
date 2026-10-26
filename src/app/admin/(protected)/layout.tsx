import Link from "next/link";
import { LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return <div className="a-shell">
    <a className="a-skip-link" href="#admin-main">შინაარსზე გადასვლა</a>
    <aside className="a-sidebar">
      <Link href="/admin" className="a-brand" aria-label="GNG ადმინისტრაცია"><img className="a-brand-logo" src="/images/gng-logo.png" alt="GNG" width={1938} height={811} /><small>მართვის პანელი</small></Link>
      <AdminNav />
      <div className="a-account"><span className="a-avatar" aria-hidden="true">{admin.email?.charAt(0).toUpperCase() || "A"}</span><div><strong>ადმინისტრატორი</strong><span title={admin.email}>{admin.email}</span></div><form action={logout}><button className="a-icon-button" type="submit" aria-label="გამოსვლა" title="გამოსვლა"><LogOut size={18} /></button></form></div>
    </aside>
    <main className="a-main" id="admin-main">{children}</main>
  </div>;
}
