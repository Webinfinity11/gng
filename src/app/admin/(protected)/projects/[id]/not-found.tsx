import Link from "next/link";
import { FolderSearch } from "lucide-react";

export default function ProjectNotFound() {
  return <div className="a-panel a-empty"><FolderSearch size={34} aria-hidden="true" /><h1>პროექტი ვერ მოიძებნა</h1><p>შესაძლოა პროექტი წაშლილია ან მისამართი არასწორია.</p><Link className="a-button" href="/admin/projects">პროექტებზე დაბრუნება</Link></div>;
}
