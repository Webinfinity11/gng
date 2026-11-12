/** A brand in the home page carousel. Built-in logos are white silhouettes on transparency, 200px tall, in /images/partners. */
export type PartnerLogo = { name: string; url: string; width: number; height: number };

/** Logos shown when there is no database; migration 008 seeds the same list into partner_logos. */
export const defaultPartnerLogos: PartnerLogo[] = [
  { name: "Bellotti", file: "bellotti", width: 749 },
  { name: "Berkvens", file: "berkvens", width: 826 },
  { name: "Magti", file: "magti", width: 700 },
  { name: "Silk Road Group", file: "silk-road-group", width: 927 },
  { name: "NCC", file: "ncc", width: 429 },
  { name: "Capitol Construction", file: "capitol-construction", width: 292 },
  { name: "Braga", file: "braga", width: 528 },
  { name: "NINZ Firedoors", file: "ninz", width: 580 },
  { name: "Simetria", file: "simetria", width: 841 },
  { name: "SCAB Design", file: "scab-design", width: 1248 },
  { name: "NOM studio", file: "nom-studio", width: 319 },
  { name: "Domus", file: "domus", width: 200 },
].map(({ name, file, width }) => ({ name, url: `/images/partners/${file}.webp`, width, height: 200 }));

/** Equal visual weight: every logo covers about the same area, within the row's limits. */
export function partnerDisplaySize(logo: PartnerLogo) {
  const ratio = logo.width / logo.height;
  const displayHeight = Math.min(60, Math.sqrt(7600 / ratio), 200 / ratio);
  return { width: Math.round(displayHeight * ratio), height: Math.round(displayHeight) };
}

export const partnerLogoLimit = 40;
