// Regression tests: a published gift may only load media from our own files,
// our storage bucket, or (for songs) https links. Run with `pnpm test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { findBadMediaUrl, storagePrefixFrom } from "../src/lib/media-urls.ts";

const prefix = storagePrefixFrom("https://abc.supabase.co")!;
const ok = (story: unknown) => assert.equal(findBadMediaUrl(story, prefix), null);
const bad = (story: unknown) => assert.notEqual(findBadMediaUrl(story, prefix), null);

test("our own files and sticker ids are fine", () => {
  ok({ scenes: [{ photo: "/a/p/cat.abc123.webp", stamp: "m-dance-cat", stickers: [{ id: "b-capy-kiss@1a2b", at: "tl" }] }] });
});

test("photos in our bucket are fine", () => {
  ok({ scenes: [{ photos: [{ src: `${prefix}user/123/01.jpg` }] }] });
});

test("a photo on someone else's server is rejected", () => {
  bad({ scenes: [{ photo: "https://evil.example/pixel.gif" }] });
  bad({ scenes: [{ photos: [{ src: "https://evil.example/a.jpg" }] }] });
  bad({ scenes: [{ stickers: [{ id: "https://evil.example/s.webp", at: "tl" }] }] });
});

test("dangerous schemes are rejected everywhere", () => {
  bad({ scenes: [{ photo: "javascript:alert(1)" }] });
  bad({ track: { link: "javascript:alert(1)" } });
  bad({ scenes: [{ photo: "data:image/svg+xml;base64,AAAA" }] });
  bad({ scenes: [{ photo: "http://abc.supabase.co/x.jpg" }] });
  bad({ scenes: [{ photo: "//evil.example/x.jpg" }] });
  bad({ scenes: [{ reaction: "blob:https://x/1" }] });
});

test("song links may be any https address", () => {
  ok({ track: { link: "https://www.youtube.com/watch?v=GxldQ9eX2wo", youtubeId: "GxldQ9eX2wo" } });
  ok({ track: { link: "https://cdn.example.com/song.mp3" } });
});

test("youtube ids must look like youtube ids", () => {
  bad({ track: { youtubeId: "abc\"><script>" } });
});

test("ordinary words that happen to be links stay allowed", () => {
  ok({ scenes: [{ paragraphs: ["see https://example.com"], title: "javascript: is fun" }] });
});
