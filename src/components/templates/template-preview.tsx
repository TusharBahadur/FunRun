import type { Template } from "@/lib/templates";
import { cn } from "@/lib/utils";

const HEART =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";
const SPARKLE =
  "M0 -1 C0.1 -0.3 0.3 -0.1 1 0 C0.3 0.1 0.1 0.3 0 1 C-0.1 0.3 -0.3 0.1 -1 0 C-0.3 -0.1 -0.1 -0.3 0 -1Z";

/** A miniature, purely visual rendering of a template — used on cards. */
export function TemplatePreview({ template, className }: { template: Template; className?: string }) {
  const { palette, preview } = template;
  return (
    <div
      className={cn(
        "@container relative aspect-[3/4] w-full select-none overflow-hidden rounded-[1.75rem]",
        className,
      )}
      style={{ backgroundColor: palette.bg, color: palette.fg }}
    >
      <svg
        viewBox="0 0 100 100"
        aria-hidden
        className="absolute inset-x-0 top-[9%] h-[56%] w-full"
      >
        <Motif template={template} />
      </svg>
      <div className="absolute inset-0 flex flex-col justify-between p-[7cqw]">
        <span className="font-mono text-[3.3cqw] uppercase tracking-[0.18em] opacity-70">
          {preview.kicker}
        </span>
        <div>
          <p className="text-balance font-serif text-[10cqw] leading-[0.98]">{preview.title}</p>
          <p className="mt-[3.5cqw] text-[3.6cqw] opacity-70">{preview.signoff}</p>
        </div>
      </div>
    </div>
  );
}

function HeartShape(props: { x: number; y: number; size: number; rotate?: number; fill: string; opacity?: number }) {
  const { x, y, size, rotate = 0, fill, opacity = 1 } = props;
  return (
    <path
      d={HEART}
      fill={fill}
      opacity={opacity}
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${size / 24}) translate(-12 -12)`}
    />
  );
}

function Petals({ fill, center, transform }: { fill: string; center: string; transform: string }) {
  return (
    <g transform={transform}>
      {Array.from({ length: 8 }).map((_, i) => (
        <ellipse key={i} cx={0} cy={-13} rx={6.5} ry={12} fill={fill} transform={`rotate(${i * 45})`} />
      ))}
      <circle r={6} fill={center} />
    </g>
  );
}

function Motif({ template }: { template: Template }) {
  const { bg, fg, accent } = template.palette;

  switch (template.motif) {
    case "hearts":
      return (
        <>
          <HeartShape x={36} y={44} size={34} rotate={-14} fill={accent} />
          <HeartShape x={68} y={28} size={20} rotate={12} fill={fg} opacity={0.85} />
          <HeartShape x={72} y={66} size={12} rotate={18} fill={accent} opacity={0.7} />
          <HeartShape x={16} y={20} size={9} rotate={-20} fill={fg} opacity={0.45} />
          <HeartShape x={86} y={44} size={6} rotate={8} fill={fg} opacity={0.4} />
        </>
      );
    case "stars":
      return (
        <>
          <circle cx={62} cy={42} r={20} fill={accent} />
          <circle cx={71} cy={34} r={18} fill={bg} />
          {[
            [22, 26, 5],
            [36, 60, 3],
            [84, 70, 4],
            [16, 72, 2.5],
            [48, 16, 2],
            [88, 18, 2.5],
          ].map(([x, y, s], i) => (
            <path key={i} d={SPARKLE} fill={fg} opacity={0.85} transform={`translate(${x} ${y}) scale(${s})`} />
          ))}
        </>
      );
    case "sun":
      return (
        <>
          <g transform="translate(50 48)">
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={i}
                x1={0}
                y1={-28}
                x2={0}
                y2={-37}
                stroke={accent}
                strokeWidth={2.6}
                strokeLinecap="round"
                transform={`rotate(${i * 30})`}
              />
            ))}
            <circle r={22} fill={accent} />
          </g>
          <path d="M8 92 Q 29 86 50 92 T 92 92" stroke={fg} strokeWidth={1.2} fill="none" opacity={0.4} />
        </>
      );
    case "polaroid":
      return (
        <>
          <g transform="rotate(9 60 48)">
            <rect x={40} y={16} width={40} height={50} rx={1.5} fill="#fff" opacity={0.7} />
            <rect x={44} y={20} width={32} height={34} fill={accent} opacity={0.35} />
          </g>
          <g transform="rotate(-7 42 48)">
            <rect x={20} y={20} width={44} height={54} rx={1.5} fill="#fff" />
            <rect x={24} y={24} width={36} height={38} fill={accent} />
            <circle cx={50} cy={34} r={5} fill={bg} opacity={0.85} />
            <path d="M24 62 L36 46 L44 55 L51 49 L60 62Z" fill={fg} opacity={0.35} />
          </g>
        </>
      );
    case "stamp":
      return (
        <>
          <path d="M6 86 C 24 62, 42 90, 62 64" stroke={fg} strokeWidth={1} strokeDasharray="2 2.5" fill="none" opacity={0.5} />
          <circle cx={46} cy={42} r={14} fill="none" stroke={fg} strokeWidth={1} opacity={0.45} />
          <path
            d="M26 38 q5 -3 10 0 t10 0 t10 0 t10 0 M26 45 q5 -3 10 0 t10 0 t10 0 t10 0"
            stroke={fg}
            strokeWidth={1}
            fill="none"
            opacity={0.45}
          />
          <g transform="rotate(7 72 34)">
            <rect x={58} y={14} width={28} height={36} fill="#fbf8f3" stroke={bg} strokeWidth={2.6} strokeDasharray="1.6 1.6" />
            <rect x={62} y={18} width={20} height={28} fill={accent} opacity={0.14} />
            <HeartShape x={72} y={32} size={13} fill={accent} />
          </g>
        </>
      );
    case "cake":
      return (
        <>
          {[30, 50, 70].map((x, i) => (
            <g key={x}>
              <rect x={x - 2.2} y={22 + (i % 2) * 3} width={4.4} height={20} rx={1.5} fill={fg} opacity={0.9} />
              <path
                d={`M${x} ${11 + (i % 2) * 3} C ${x + 4} ${16 + (i % 2) * 3}, ${x + 3} ${21 + (i % 2) * 3}, ${x} ${21 + (i % 2) * 3} C ${x - 3} ${21 + (i % 2) * 3}, ${x - 4} ${16 + (i % 2) * 3}, ${x} ${11 + (i % 2) * 3}Z`}
                fill={accent}
              />
            </g>
          ))}
          <rect x={14} y={42} width={72} height={46} rx={7} fill={accent} />
          <path
            d="M14 52 V48 a6 6 0 0 1 6 -6 H80 a6 6 0 0 1 6 6 V52 q-4.5 7 -9 0 t-9 0 t-9 0 t-9 0 t-9 0 t-9 0 t-9 0 t-9 0z"
            fill="#fff"
            opacity={0.9}
          />
          <path d="M14 70 H86" stroke="#fff" strokeWidth={1.6} strokeDasharray="0.1 5" strokeLinecap="round" opacity={0.8} />
          <rect x={6} y={88} width={88} height={4} rx={2} fill={fg} opacity={0.25} />
        </>
      );
    case "bloom":
      return (
        <>
          <Petals fill={accent} center={fg} transform="translate(46 46)" />
          <Petals fill={accent} center={fg} transform="translate(78 72) scale(.45)" />
          <Petals fill={fg} center={accent} transform="translate(18 22) scale(.32)" />
        </>
      );
  }
}
