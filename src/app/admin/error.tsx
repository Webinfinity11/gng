"use client";

import Link from "next/link";
import { CircleAlert, RefreshCw } from "lucide-react";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="a-error-page"><CircleAlert size={34} aria-hidden="true" /><h1>მონაცემები ვერ ჩაიტვირთა</h1><p>შეამოწმეთ მონაცემთა ბაზასთან კავშირი და სცადეთ ხელახლა.</p><button type="button" className="a-button" onClick={reset}><RefreshCw size={16} aria-hidden="true" />ხელახლა ცდა</button><Link href="/" className="a-back-link">საიტზე დაბრუნება</Link></div>;
}
