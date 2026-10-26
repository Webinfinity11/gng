import type { Metadata } from "next";
import "./admin.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "მართვის პანელი · GNG", template: "%s · GNG-ის მართვის პანელი" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root">{children}</div>;
}
