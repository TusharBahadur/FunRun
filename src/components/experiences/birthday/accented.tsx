import type { CSSProperties } from "react";

const accentVars: CSSProperties = {
  fontFamily: "var(--accent-face, inherit)",
  fontWeight: "var(--accent-weight, 600)" as unknown as number,
  fontStyle: "var(--accent-style, normal)",
  letterSpacing: "var(--accent-tracking, inherit)",
};

/** Renders text where *starred* words become the highlighted accent style. */
export function Accented({
  text,
  color,
  /** Gifts default to a sans highlight — never the thin italic serif. */
  face = "sans",
}: {
  text: string;
  color?: string;
  face?: "accent" | "sans";
}) {
  const accentClass = face === "accent" ? "type-accent font-normal" : "gift-accent font-semibold";
  // Inside a gift, the sender's highlight style (set as CSS variables on the gift root, see accent-moods.ts).
  // Anywhere else the variables are unset, so it's simply semi-bold.
  const sansStyle = face === "sans" ? accentVars : undefined;
  return (
    <>
      {text.split(/(\*[^*]+\*)/).map((part, i) =>
        part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
          <span key={i} data-accent className={accentClass} style={{ ...sansStyle, color }}>
            {part.slice(1, -1)}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
