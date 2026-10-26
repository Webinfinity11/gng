"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, FolderKanban, House, Mail, MapPin, Tags } from "lucide-react";

const items = [
  { href: "/admin", label: "მიმოხილვა", icon: House },
  { href: "/admin/projects", label: "პროექტები", icon: FolderKanban },
  { href: "/admin/categories", label: "კატეგორიები", icon: Tags },
  { href: "/admin/contact", label: "საკონტაქტო ინფორმაცია", icon: MapPin },
  { href: "/admin/inquiries", label: "შეტყობინებები", icon: Mail },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <>
      <nav className="a-nav" aria-label="ადმინისტრაცია">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return <Link href={href} key={href} className={active ? "a-nav-link active" : "a-nav-link"} aria-current={active ? "page" : undefined}><Icon size={19} aria-hidden="true" /><span>{label}</span></Link>;
        })}
      </nav>
      <Link className="a-site-link" href="/" target="_blank" rel="noreferrer">საიტის ნახვა <ArrowUpRight size={17} aria-hidden="true" /></Link>
    </>
  );
}
