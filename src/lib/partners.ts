/** Partner logos: white silhouettes on transparency, 200px tall, in /images/partners (sources: Desktop/ლოგო). */
export const partnerLogos = [
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
].map(logo => {
  const height = 200;
  // Equal visual weight: every logo covers about the same area, within the row's limits.
  const ratio = logo.width / height;
  const displayHeight = Math.min(60, Math.sqrt(7600 / ratio), 200 / ratio);
  return { ...logo, src: `/images/partners/${logo.file}.webp`, height, displayWidth: Math.round(displayHeight * ratio), displayHeight: Math.round(displayHeight) };
});
