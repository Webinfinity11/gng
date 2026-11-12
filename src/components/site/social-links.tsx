import { Facebook, Instagram, Linkedin } from "lucide-react";
import type { ContactSettings } from "@/lib/types";

const networks = [
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "facebook", label: "Facebook", Icon: Facebook },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
] as const;

/** Social profiles from admin → საკონტაქტო ინფორმაცია; empty fields are not shown. */
export function SocialLinks({ contact, label, className = "" }: { contact: ContactSettings; label: string; className?: string }) {
  const links = networks.filter(network => contact[network.key]?.trim());
  if (!links.length) return null;
  return <nav className={`gng-social ${className}`} aria-label={label}>
    {links.map(({ key, label: name, Icon }) => <a key={key} href={contact[key].trim()} target="_blank" rel="noopener noreferrer" className="gng-social-link" aria-label={name} title={name}><Icon size={18} aria-hidden="true" /></a>)}
  </nav>;
}
