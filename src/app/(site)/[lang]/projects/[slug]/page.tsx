import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProject } from "@/lib/data";
import { isLocale } from "@/lib/i18n/config";
import { galleryText, getDictionary, type LangParams } from "@/lib/i18n/dictionaries";
import { ProjectGallery } from "@/components/site/project-gallery";

type Props = LangParams<{ slug: string }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const project = await getPublicProject(slug, lang);
  return project ? { title: project.title, description: project.summary || project.description.trim().slice(0, 160) || undefined } : { title: getDictionary(lang).meta.projectNotFound };
}

export default async function ProjectPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const project = await getPublicProject(slug, lang);
  if (!project) notFound();
  const paragraphs = project.description.split(/\n\s*\n/).map(part => part.trim()).filter(Boolean);
  const images =[...new Set([project.cover_url, ...project.images].filter(Boolean))];
  return <>
    <section className="gng-project-title"><div className="w-layout-blockcontainer container w-container"><h1 className="optik-inner-title">{project.title}</h1>{paragraphs.length > 0 && <div className="gng-project-description">{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>}</div></section>
    <ProjectGallery images={images} title={project.title} text={galleryText(getDictionary(lang), images.length)} />
  </>;
}
