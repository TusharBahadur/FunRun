/**
 * Records the home-page showcase videos: ~6s of each gift's first page, at
 * phone size, so the phone stack can play a video instead of running three
 * live gifts (which lagged on phones).
 *
 * Setup (once):   pnpm add -D playwright && pnpm exec playwright install chromium
 * Run:            pnpm dev   (in another terminal), then
 *                 node scripts/record-showcase.mjs
 * Output:         recordings/<slug>.webm and recordings/meta.json
 *
 * The raw recordings are then encoded to small MP4s + posters in public/showcase.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const SECONDS = Number(process.env.SECONDS || 6.5);
const OUT = path.resolve("recordings");
const { slugs } = JSON.parse(await fs.readFile("src/data/showcase.json", "utf8"));
const only = process.argv.slice(2);
const list = only.length ? slugs.filter((s) => only.includes(s)) : slugs;

// Everything around the gift that shouldn't be in the video.
const HIDE = `
  nav[aria-label="Preview"], a[href^="/studio/"],
  [aria-label="Previous page"], [aria-label="Play the music"], [aria-label="Stop the music"],
  nextjs-portal, [data-nextjs-toast] { display: none !important; }
  * { cursor: none !important; }
`;

await fs.mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const meta = {};

// Dev compiles each page on first visit: warm them up first so the recording
// shows the gift, not a loading screen.
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  for (const slug of list) {
    process.stdout.write(`warming ${slug}… `);
    await page.goto(`${BASE}/preview/${slug}`, { waitUntil: "networkidle", timeout: 120_000 });
    console.log("ok");
  }
  await ctx.close();
}

for (const slug of list) {
  const started = Date.now();
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    recordVideo: { dir: OUT, size: { width: 780, height: 1688 } },
  });
  const page = await ctx.newPage();
  await page.addInitScript((css) => {
    document.addEventListener("DOMContentLoaded", () => {
      const s = document.createElement("style");
      s.textContent = css;
      document.head.appendChild(s);
    });
  }, HIDE);
  await page.goto(`${BASE}/preview/${slug}`, { waitUntil: "networkidle", timeout: 120_000 });
  await page.waitForTimeout(400);
  // Where the gift is ready, in seconds from the start of the recording: the encoder trims to here.
  meta[slug] = { start: (Date.now() - started) / 1000, seconds: SECONDS };
  await page.waitForTimeout(SECONDS * 1000);
  const video = page.video();
  await ctx.close();
  await video.saveAs(path.join(OUT, `${slug}.webm`));
  await video.delete();
  console.log(`recorded ${slug} (starts at ${meta[slug].start.toFixed(1)}s)`);
}

await fs.writeFile(path.join(OUT, "meta.json"), JSON.stringify(meta, null, 2));
await browser.close();
console.log(`\nDone: ${list.length} recordings in ${OUT}`);
