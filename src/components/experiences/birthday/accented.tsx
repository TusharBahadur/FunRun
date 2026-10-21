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
  const accentClass = face === "accent" ? "type-accent font-normal" : "font-semibold";
  return (
    <>
      {text.split(/(\*[^*]+\*)/).map((part, i) =>
        part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
          <span key={i} data-accent className={accentClass} style={{ color }}>
            {part.slice(1, -1)}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
