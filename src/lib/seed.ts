import type { ContactSettings, Hero, Project } from "./types";
import { sitePhotos } from "./site-media";
import { referenceProjects } from "./optik-content";
import { suggestCategoryId } from "./categories";

export const defaultHero: Hero = {
  id: 1,
  eyebrow: "",
  title: "ავეჯი თქვენი სივრცისთვის",
  description: "იდეიდან განხორციელებამდე - ვქმნით ინდივიდუალურ ავეჯს, რომელიც აერთიანებს დიზაინს, კომფორტსა და ფუნქციურობას.",
  image_url: sitePhotos.hero.src,
  button_label: "ნახეთ პროექტები",
  button_href: "/projects",
  title_en: "Furniture for Your Space",
  description_en: "From idea to completion - we create bespoke furniture that brings together design, comfort and functionality.",
  button_label_en: "View projects",
};

// Contact details supplied by the user; optional social links remain configurable.
export const defaultContact: ContactSettings = {
  id: 1,
  phone: "+995 551 39 77 66",
  phones: ["+995 551 39 77 66"],
  email: "gngteam.ge@gmail.com",
  address: "პეტრე იბერის ქუჩა 4, თბილისი",
  map_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("პეტრე იბერის ქუჩა 4, თბილისი")}`,
  instagram: "",
  facebook: "",
  linkedin: "",
  address_en: "4 Petre Iberi St, Tbilisi",
};

// Names and location hints come from the supplied project list. Projects with supplied
// photographs (the ones shown before a database exists) start published and featured,
// so connecting the database keeps the site's portfolio; the rest are drafts.
const projectNames = [
  ["radisson-blu-iveria-pool", "Radisson Blu Iveria - საცურაო აუზი", "", "Radisson Blu Iveria - Swimming Pool", ""],
  ["mango-tbilisi-mall", "Mango - ბრენდული მაღაზია", "თბილისი მოლი", "Mango - Brand Store", "Tbilisi Mall"],
  ["cafe-iveria", "კაფე ივერია - Radisson Blu Iveria", "", "Cafe Iveria - Radisson Blu Iveria", ""],
  ["georgian-museum-fine-arts", "ქართული სახვითი ხელოვნების მუზეუმი", "", "Georgian Museum of Fine Arts", ""],
  ["lebowski-bowling", "Lebowski - ბოულინგ კლუბი", "ისთ ფოინთი", "Lebowski - Bowling Club", "East Point"],
  ["courtyard-marriott-tbilisi", "GMT Plaza Tbilisi - Courtyard by Marriott-ის რეცეფცია", "თბილისი", "GMT Plaza Tbilisi - Courtyard by Marriott Reception", "Tbilisi"],
  ["focus-mokus", "Focus Mokus - ბავშვთა გასართობი ცენტრი", "ისთ ფოინთი", "Focus Mokus - Kids' Entertainment Centre", "East Point"],
  ["socar-office", "SOCAR - მომსახურების ოფისი", "თბილისი", "SOCAR - Service Office", "Tbilisi"],
  ["ponte-vecchio", "პონტე ვეკიო - საიუველირო მაღაზია", "", "Ponte Vecchio - Jewellery Store", ""],
  ["domus-office", "დომუსი - სათაო ოფისი", "", "Domus - Head Office", ""],
  ["tbili-sakhli-office", "თბილი სახლი - სათაო ოფისი", "", "Tbili Sakhli - Head Office", ""],
  ["best-western-kutaisi", "Best Western Kutaisi", "ქუთაისი", "Best Western Kutaisi", "Kutaisi"],
  ["metro-complex-republic", "Metro Complex - Republic, Radisson Blu Iveria", "", "Metro Complex - Republic, Radisson Blu Iveria", ""],
  ["red-co-new-gudauri", "Red-Co New Gudauri - აპარტამენტები, კაზინო და რესტორანი", "ახალი გუდაური", "Red-Co New Gudauri - Apartments, Casino and Restaurant", "New Gudauri"],
  ["moxy-breakfast-area", "Moxy - საუზმის სივრცე", "", "Moxy - Breakfast Area", ""],
  ["cafe-cela", "Cela - კაფე", "ფუნიკულიორი", "Cela - Cafe", "Funicular"],
  ["khedi-hotel", "ხედი - სასტუმრო", "ავლაბარი", "Khedi - Hotel", "Avlabari"],
  ["philip-morris-georgia", "Philip Morris Georgia - სათაო ოფისი", "", "Philip Morris Georgia - Head Office", ""],
  ["coca-cola-bottlers-georgia", "კოკა კოლა ბოთლერს ჯეორჯია - ახალი ქარხანა და სათაო ოფისი", "", "Coca-Cola Bottlers Georgia - New Plant and Head Office", ""],
  ["vazisubani-estate", "ვაზისუბნის მამული - სასტუმრო", "", "Vazisubani Estate - Hotel", ""],
  ["casino-iveria", "ივერია - კაზინო", "", "Iveria - Casino", ""],
  ["holiday-inn-avlabari", "Holiday Inn - სასტუმრო", "ავლაბარი", "Holiday Inn - Hotel", "Avlabari"],
  ["hotel-21", "Hotel 21", "", "Hotel 21", ""],
  ["todua-clinic", "თოდუას კლინიკა", "ვერა", "Todua Clinic", "Vera"],
  ["aartizan-design-hotel", "AArtizan Design Hotel", "", "AArtizan Design Hotel", ""],
] as const;

const photographed = new Map(referenceProjects.map(project => [project.slug, project.images]));

export const seedProjects: Project[] = projectNames.map(([slug, title, location, title_en, location_en], index) => ({
  id: `98a1a000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  slug,
  title,
  summary: "",
  description: "",
  category: "",
  category_id: suggestCategoryId(title_en),
  location,
  year: null,
  cover_url: photographed.get(slug)?.[0] ?? "",
  images: photographed.get(slug)?.slice(1) ?? [],
  status: photographed.has(slug) ? "published" : "draft",
  featured: photographed.has(slug),
  sort_order: index,
  title_en,
  location_en,
}));
