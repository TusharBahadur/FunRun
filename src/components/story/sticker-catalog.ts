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

export type StickerCategory = "all" | "love" | "cat" | "animal" | "meme" | "celebration" | "friends" | "words" | "cute" | "drawn";

/** The tabs in the studio's sticker picker, in the order they're shown. */
export const stickerCategories = [
  { id: "all", label: "All" },
  { id: "love", label: "❤️ Love" },
  { id: "cat", label: "🐱 Cats" },
  { id: "animal", label: "🐶 Animals" },
  { id: "meme", label: "😂 Memes" },
  { id: "celebration", label: "🎉 Party" },
  { id: "friends", label: "👯 Friends & family" },
  { id: "words", label: "💬 Words" },
  { id: "cute", label: "🌸 Cute" },
  { id: "drawn", label: "✏️ Drawn" },
] as const;

export function stickerCategory(id: AnyStickerId): string {
  const ref = boardRef(id);
  if (ref) return board[ref.key]?.category || "cute";
  return "drawn";
}
