import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/data";
import { siteUrl } from "@/lib/config";
import { localePath, locales, sitePages } from "@/lib/i18n/config";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const projects = await getProjects();
  const paths = [...sitePages, ...projects.map(project => `/projects/${project.slug}`)];
  return paths.map(path => {
    const languages = Object.fromEntries(locales.map(locale => [locale, `${base}${localePath(locale, path)}`]));
    return { url: languages.ka, alternates: { languages } };
  });
}
