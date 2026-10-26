// Georgian national romanization, so a page address can be derived from a Georgian title.
const georgian: Record<string, string> = {
  ა: "a", ბ: "b", გ: "g", დ: "d", ე: "e", ვ: "v", ზ: "z", თ: "t", ი: "i", კ: "k", ლ: "l", მ: "m", ნ: "n", ო: "o", პ: "p", ჟ: "zh", რ: "r",
  ს: "s", ტ: "t", უ: "u", ფ: "p", ქ: "k", ღ: "gh", ყ: "q", შ: "sh", ჩ: "ch", ც: "ts", ძ: "dz", წ: "ts", ჭ: "ch", ხ: "kh", ჯ: "j", ჰ: "h",
};

/** "ხედი - სასტუმრო" -> "khedi-sastumro"; falls back to "project" when nothing usable remains. */
export function slugify(title: string) {
  const latin = [...title.toLowerCase()].map(char => georgian[char] ?? char).join("");
  const slug = latin.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80).replace(/-+$/, "");
  return slug || "project";
}

/** First of slug, slug-2, slug-3, ... that is not already taken. */
export function uniqueSlug(base: string, taken: Iterable<string>) {
  const used = new Set(taken);
  if (!used.has(base)) return base;
  let index = 2;
  while (used.has(`${base}-${index}`)) index++;
  return `${base}-${index}`;
}
