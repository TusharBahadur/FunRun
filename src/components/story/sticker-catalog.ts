import boardData from "@/data/stickers.json";
import { boardRef, isUploadedSticker, stickerNames, type AnyStickerId, type StickerId } from "./stickers";

/**
 * The full board-sticker catalogue: names and categories for the studio's
 * sticker picker. Kept out of ./stickers so pages that only draw stickers
 * (the home page, gifts) don't download ~900 names they never show.
 */
type BoardSticker = { file: string; name: string; kind: "doodle" | "meme"; category: string; retired?: boolean };
const board = boardData as Record<string, BoardSticker>;

export const boardStickerIds = Object.keys(board).filter((id) => !board[id].retired);

export function stickerName(id: AnyStickerId) {
  if (isUploadedSticker(id)) return "Your sticker";
  const ref = boardRef(id);
  if (ref) return board[ref.key]?.name ?? "Sticker";
  return stickerNames[id as StickerId] ?? "Sticker";
}

export type StickerCategory = "all" | "love" | "cat" | "meme" | "doodle" | "celebration" | "family" | "animated";

export const stickerCategories = [
  { id: "all", label: "All" },
  { id: "love", label: "❤️ Love" },
  { id: "cat", label: "🐱 Cats & Dogs" },
  { id: "meme", label: "😂 Memes" },
  { id: "doodle", label: "✨ Doodles" },
  { id: "celebration", label: "🎉 Party" },
  { id: "family", label: "👨‍👩‍👧 Family" },
  { id: "animated", label: "✨ Animated" },
] as const;

export function stickerCategory(id: AnyStickerId): string {
  const ref = boardRef(id);
  if (ref) return board[ref.key]?.category || "doodle";
  return "animated";
}
