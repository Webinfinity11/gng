// Prepares project photos from a public MEGA folder link (see docs/adding-projects.md).
//
//   node scripts/mega-photos.mjs list  <mega-url>
//   node scripts/mega-photos.mjs sheet <mega-url> --out <dir>
//   node scripts/mega-photos.mjs prepare <mega-url> --out <dir> --cover <file> [--files a,b,c | --count 12]
//
// "sheet" saves a numbered contact sheet of every photo for choosing; "prepare" writes
// 00-cover.webp, 01.webp, … processed like the admin upload (rotate, 2400px max, WebP 85).
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { File } from "megajs";
import sharp from "sharp";

const [command, url, ...rest] = process.argv.slice(2);
const option = (name) => { const index = rest.indexOf(`--${name}`); return index >= 0 ? rest[index + 1] : undefined; };
if (!["list", "sheet", "prepare"].includes(command) || !url) {
  console.error("Usage: node scripts/mega-photos.mjs list|sheet|prepare <mega-folder-url> [--out dir] [--cover file] [--files a,b] [--count n]");
  process.exit(1);
}

// A link to a sub-folder looks like https://mega.nz/folder/<id>#<key>/folder/<subId>.
async function openFolder(link) {
  const match = link.match(/^(https:\/\/mega\.nz\/folder\/[^#]+#[^/]+)(?:\/folder\/([\w-]+))?/);
  if (!match) throw new Error("Not a MEGA folder link.");
  const root = File.fromURL(match[1]);
  await root.loadAttributes();
  if (!match[2]) return root;
  const find = (node) => (node.downloadId?.[1] === match[2] || node.nodeId === match[2]) ? node : (node.children ?? []).map(find).find(Boolean);
  const folder = find(root);
  if (!folder) throw new Error("Sub-folder not found in the shared link.");
  return folder;
}

const isPhoto = (file) => !file.directory && /\.(jpe?g|png|webp|heic|heif|avif|tiff?)$/i.test(file.name);
const download = async (file) => Buffer.from(await file.downloadBuffer());

const folder = await openFolder(url);
const photos = (folder.children ?? []).filter(isPhoto).sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));
const skipped = (folder.children ?? []).filter(file => !file.directory && !isPhoto(file)).map(file => file.name);
console.log(`${folder.name}: ${photos.length} photos${skipped.length ? `, skipped ${skipped.length} other files (${skipped.slice(0, 5).join(", ")})` : ""}`);

if (command === "list") {
  photos.forEach((file, index) => console.log(`${String(index + 1).padStart(3)}  ${file.name}  ${(file.size / 1e6).toFixed(1)} MB`));
  process.exit(0);
}

const out = option("out");
if (!out) throw new Error("--out <dir> is required.");
await mkdir(out, { recursive: true });

if (command === "sheet") {
  // 6 columns of 300px tiles, each labelled with its number and file name.
  const tile = 300, label = 34, columns = 6;
  const tiles = [];
  for (const [index, file] of photos.entries()) {
    process.stdout.write(`\rdownloading ${index + 1}/${photos.length}`);
    const image = await sharp(await download(file), { limitInputPixels: false }).rotate().resize(tile, tile, { fit: "cover" }).toBuffer();
    const caption = `${index + 1}. ${file.name}`.replace(/[<&>]/g, "");
    const text = Buffer.from(`<svg width="${tile}" height="${label}"><rect width="100%" height="100%" fill="#111"/><text x="8" y="23" font-family="Arial" font-size="17" fill="#fff">${caption}</text></svg>`);
    tiles.push(await sharp({ create: { width: tile, height: tile + label, channels: 3, background: "#111" } }).composite([{ input: image, top: 0, left: 0 }, { input: text, top: tile, left: 0 }]).jpeg().toBuffer());
  }
  const rows = Math.ceil(tiles.length / columns);
  await sharp({ create: { width: columns * tile, height: rows * (tile + label), channels: 3, background: "#fff" } })
    .composite(tiles.map((input, index) => ({ input, left: (index % columns) * tile, top: Math.floor(index / columns) * (tile + label) })))
    .jpeg({ quality: 80 }).toFile(join(out, "contact-sheet.jpg"));
  console.log(`\nSaved ${join(out, "contact-sheet.jpg")}`);
}

if (command === "prepare") {
  const coverName = option("cover");
  const cover = photos.find(file => file.name === coverName);
  if (!cover) throw new Error(`Cover photo "${coverName}" is not in this folder.`);
  let gallery;
  if (option("files")) {
    const names = option("files").split(",").map(name => name.trim()).filter(Boolean);
    gallery = names.map(name => photos.find(file => file.name === name) ?? (() => { throw new Error(`Photo "${name}" is not in this folder.`); })());
  } else {
    // Evenly spread picks across the shoot, so similar consecutive frames are not chosen together.
    const others = photos.filter(file => file !== cover);
    const count = Math.min(Number(option("count") || 12) - 1, others.length);
    gallery = Array.from({ length: count }, (_, index) => others[Math.floor((index + 0.5) * others.length / count)]);
  }
  const chosen = [cover, ...gallery.filter(file => file !== cover)].slice(0, 31);
  const manifest = [];
  for (const [index, file] of chosen.entries()) {
    const name = index === 0 ? "00-cover.webp" : `${String(index).padStart(2, "0")}.webp`;
    // Same processing as src/app/api/upload/route.ts; metadata (including GPS) is not copied.
    const image = await sharp(await download(file), { limitInputPixels: false }).rotate().resize(2400, 2400, { fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
    await writeFile(join(out, name), image);
    manifest.push({ file: name, source: file.name, kb: Math.round(image.length / 1024) });
    console.log(`${name}  <-  ${file.name}  (${Math.round(image.length / 1024)} KB)`);
  }
  await writeFile(join(out, "manifest.json"), JSON.stringify({ folder: folder.name, photos: manifest }, null, 2));
}
