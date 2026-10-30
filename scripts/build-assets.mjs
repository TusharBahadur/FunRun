#!/usr/bin/env node
/**
 * Builds fingerprinted WebP images from the sources in assets/.
 *
 *   assets/stickers/<file>  → public/a/s/<sticker id>.<hash>.webp   (max 512px)
 *   assets/photos/<file>    → public/a/p/<name>.<hash>.webp         (max 1600px)
 *
 * <hash> comes from the source file's bytes, so replacing a source makes a new
 * file and leaves the old one alone. Published gifts point at exact files, so
 * they never change. Old outputs are never deleted.
 *
 * Writes src/data/sticker-hashes.json, src/data/sticker-memes.json, src/data/sticker-stills.json
 * and src/data/asset-files.json. Animated stickers also get <id>.<hash>.still.webp (first frame).
 * Runs before `dev` and `build`. Only needs sharp when something new must be
 * converted (sharp ships with Next.js).
 *
 *   npm run assets           build anything missing
 *   npm run assets -- --check  fail if anything is out of date (for CI)
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const VERSION = "tynitales-assets-v1\0";
const check = process.argv.includes("--check");

const rel = (...p) => path.join(ROOT, ...p);
const readJson = async (p, fallback) => {
  try {
    return JSON.parse(await fs.readFile(rel(p), "utf8"));
  } catch {
    return fallback;
  }
};

const stickers = await readJson("src/data/stickers.json", {});
const previous = await readJson("src/data/asset-files.json", {});

/** @type {{ key: string; source: string; outDir: string; name: string; max: number; quality: number; sticker?: string }[]} */
const jobs = [];
for (const [id, s] of Object.entries(stickers)) {
  jobs.push({ key: `stickers/${s.file}`, source: `assets/stickers/${s.file}`, outDir: "public/a/s", name: id, max: 512, quality: 78, sticker: id });
}
for (const file of (await fs.readdir(rel("assets/photos"))).sort()) {
  if (!/\.(jpe?g|png|webp|gif)$/i.test(file)) continue;
  jobs.push({ key: `photos/${file}`, source: `assets/photos/${file}`, outDir: "public/a/p", name: path.parse(file).name, max: 1600, quality: 80 });
}

let sharp = null;
const loadSharp = async () => (sharp ??= (await import("sharp")).default);

const hashes = {};
const files = {};
let built = 0;
const stale = [];
const stills = [];

for (const job of jobs) {
  const buf = await fs.readFile(rel(job.source)).catch(() => {
    throw new Error(`Missing source ${job.source}`);
  });
  const hash = createHash("sha256").update(VERSION).update(buf).digest("hex").slice(0, 10);
  const out = `${job.outDir}/${job.name}.${hash}.webp`;
  const src = "/" + out.replace(/^public\//, "");
  let entry = previous[job.key]?.src === src ? previous[job.key] : null;

  if (!existsSync(rel(out)) || !entry) {
    if (check) {
      stale.push(job.source);
      continue;
    }
    const s = await loadSharp();
    await fs.mkdir(rel(job.outDir), { recursive: true });
    if (!existsSync(rel(out))) {
      await s(buf, { animated: true })
        .resize({ width: job.max, height: job.max, fit: "inside", withoutEnlargement: true })
        .webp({ quality: job.quality, effort: 6 })
        .toFile(rel(out));
      built++;
    }
    const meta = await s(rel(out)).metadata();
    entry = { h: meta.pageHeight ?? meta.height, src, w: meta.width };
  }
  if (job.sticker) hashes[job.sticker] = hash;
  // Animated stickers also get a small still (first frame) for thumbnails and
  // the studio picker, where a 300 KB animation at 50px is wasted.
  // An animated WebP has an ANIM chunk near the start of the file.
  if (job.sticker && existsSync(rel(out)) && (await fs.readFile(rel(out))).subarray(0, 64).includes("ANIM")) {
    const still = `${job.outDir}/${job.name}.${hash}.still.webp`;
    if (!existsSync(rel(still)) && !check) {
      const s = await loadSharp();
      await s(rel(out), { pages: 1 }).resize({ width: 256, height: 256, fit: "inside", withoutEnlargement: true }).webp({ quality: 80, effort: 6 }).toFile(rel(still));
    }
    stills.push(`${job.sticker}.${hash}`);
  }
  files[job.key] = entry;
}

if (check) {
  if (stale.length) {
    console.error(`Assets out of date (run npm run assets):\n  ${stale.join("\n  ")}`);
    process.exit(1);
  }
  console.log(`assets: ${jobs.length} up to date`);
  process.exit(0);
}

const write = (p, obj, sort) => {
  const keys = sort ? Object.keys(obj).sort() : Object.keys(obj);
  const body = keys.map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(obj[k])}`).join(",\n");
  return fs.writeFile(rel(p), `{\n${body}\n}\n`);
};
await write("src/data/sticker-hashes.json", hashes, true);
// The few bits every page needs to draw a sticker, kept apart from the full
// catalogue (names, categories), which only the studio's picker loads.
const memes = Object.entries(stickers).filter(([, s]) => s.kind === "meme" && !s.retired).map(([id]) => id).sort();
await fs.writeFile(rel("src/data/sticker-memes.json"), `[\n${memes.map((id) => `  ${JSON.stringify(id)}`).join(",\n")}\n]\n`);
await fs.writeFile(rel("src/data/sticker-stills.json"), `[\n${stills.sort().map((k) => `  ${JSON.stringify(k)}`).join(",\n")}\n]\n`);
await write("src/data/asset-files.json", files, true);
console.log(`assets: ${jobs.length} images, ${built} newly built`);
