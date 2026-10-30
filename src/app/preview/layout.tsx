import type { ReactNode } from "react";
import { giftFontVariables } from "@/components/story/gift-font-faces";

/**
 * The 18 extra gift fonts are only registered on pages that show a gift or
 * the studio, so the rest of the site doesn't carry their @font-face rules
 * (about 33 KB of CSS) in every page. `contents` keeps the layout untouched;
 * the font variables still pass down to everything inside.
 */
export default function GiftFontsLayout({ children }: { children: ReactNode }) {
  return <div className={`contents ${giftFontVariables}`}>{children}</div>;
}
