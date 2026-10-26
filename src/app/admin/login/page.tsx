import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isAuthConfigured } from "@/lib/config";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "შესვლა" };
export default function LoginPage() {
  if (!isAuthConfigured()) redirect("/admin/setup");
  return <main className="a-auth-wrap"><div className="a-auth-card"><Link href="/" className="a-brand a-auth-brand"><img className="a-brand-logo" src="/images/gng-logo.png" alt="GNG" width={1938} height={811} /></Link><p className="a-eyebrow">ადმინისტრაცია</p><h1>კეთილი იყოს თქვენი დაბრუნება</h1><p className="a-subtitle">შედით საიტის კონტენტის სამართავად.</p><LoginForm /><Link className="a-back-link" href="/"><ArrowLeft size={16} aria-hidden="true" />საიტზე დაბრუნება</Link></div></main>;
}
