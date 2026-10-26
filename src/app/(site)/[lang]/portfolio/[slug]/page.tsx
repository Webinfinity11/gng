import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { galleryText, getDictionary, type LangParams } from "@/lib/i18n/dictionaries";
import { ProjectGallery } from "@/components/site/project-gallery";
import { referenceProjects } from "@/lib/optik-content";

type Props = LangParams<{ slug: string }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const project = referenceProjects.find(item => item.slug === slug);
  return { title: project ? project.title[lang] : getDictionary(lang).meta.projectNotFound };
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const project = referenceProjects.find(item => item.slug === slug);
  if (!project) notFound();
  const images = project.images;
  return <>
    <section className="gng-project-title"><div className="w-layout-blockcontainer container w-container"><h1 className="optik-inner-title">{project.title[lang]}</h1></div></section>
    <ProjectGallery images={images} title={project.title[lang]} text={galleryText(getDictionary(lang), images.length)} />
  </>;
}
