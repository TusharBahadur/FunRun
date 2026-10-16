/** Renders text where *starred* words become the highlighted accent style. */
export function Accented({ text, color }: { text: string; color?: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/).map((part, i) =>
        part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
          <span key={i} className="type-accent font-normal" style={{ color }}>
            {part.slice(1, -1)}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
