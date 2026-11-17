/**
 * Two little die-cut stickers for the footer banner. Drawn here (our own art),
 * with a white border and a soft shadow like a real sticker.
 */

const INK = "#1b1215";
const ROSE = "#e23b54";
const BLUSH = "#f6d3cf";
const CREAM = "#fde7c8";

export function PartyCatSticker({ className }: { className?: string }) {
  const shape = (
    <>
      <path d="M22 44 L27 16 L45 32 Z" />
      <path d="M78 44 L73 16 L55 32 Z" />
      <ellipse cx="50" cy="58" rx="34" ry="28" />
      <path d="M50 4 L39 31 L61 31 Z" />
      <circle cx="50" cy="5" r="5" />
    </>
  );
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className} style={{ filter: "drop-shadow(0 6px 10px rgb(27 18 21 / 0.18))" }}>
      <g fill="#fff" stroke="#fff" strokeWidth="12" strokeLinejoin="round">{shape}</g>
      <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
        <path d="M22 44 L27 16 L45 32 Z" fill={CREAM} />
        <path d="M78 44 L73 16 L55 32 Z" fill={CREAM} />
        <path d="M29 24 L31 36 L38 32 Z" fill={BLUSH} stroke="none" />
        <path d="M71 24 L69 36 L62 32 Z" fill={BLUSH} stroke="none" />
        <ellipse cx="50" cy="58" rx="34" ry="28" fill={CREAM} />
        <path d="M50 4 L39 31 L61 31 Z" fill={ROSE} />
        <circle cx="50" cy="5" r="5" fill={BLUSH} />
      </g>
      <g fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round">
        <path d="M34 56 q5 -6 10 0" />
        <path d="M56 56 q5 -6 10 0" />
        <path d="M45 66 q2.5 3.5 5 0 q2.5 3.5 5 0" />
      </g>
      <ellipse cx="32" cy="66" rx="5" ry="3" fill={ROSE} opacity="0.35" />
      <ellipse cx="68" cy="66" rx="5" ry="3" fill={ROSE} opacity="0.35" />
    </svg>
  );
}

export function GiftSticker({ className }: { className?: string }) {
  const heart = "M80 10 c-3 -5 -10 -3 -10 3 c0 5 10 11 10 11 s10 -6 10 -11 c0 -6 -7 -8 -10 -3 Z";
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className} style={{ filter: "drop-shadow(0 6px 10px rgb(27 18 21 / 0.18))" }}>
      <g fill="#fff" stroke="#fff" strokeWidth="12" strokeLinejoin="round">
        <rect x="16" y="44" width="68" height="46" rx="6" />
        <rect x="10" y="32" width="80" height="16" rx="5" />
        <path d="M50 33 C34 12 18 26 50 33 C66 12 82 26 50 33 Z" />
        <path d={heart} />
      </g>
      <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
        <rect x="16" y="44" width="68" height="46" rx="6" fill={ROSE} />
        <rect x="10" y="32" width="80" height="16" rx="5" fill={ROSE} />
        <rect x="44" y="32" width="12" height="58" fill={CREAM} />
        <path d="M50 33 C34 12 18 26 50 33" fill={BLUSH} />
        <path d="M50 33 C66 12 82 26 50 33" fill={BLUSH} />
        <path d={heart} fill={ROSE} />
      </g>
    </svg>
  );
}
