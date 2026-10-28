import { cn } from "@/lib/utils";
import { TONES } from "./tones";
import type { PhotoTone } from "./types";

/** A real photo when one was uploaded, otherwise a soft placeholder. */
export function PhotoFill({
  src,
  tone,
  alt,
  iconClassName,
  className,
}: {
  src?: string;
  tone: PhotoTone;
  alt: string;
  iconClassName?: string;
  className?: string;
}) {
  if (src) {
    return (
      // Sender uploads are local data URLs, so next/image adds nothing here.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} loading="lazy" decoding="async" draggable={false} className={cn("object-cover", className)} />
    );
  }
  const t = TONES[tone];
  const Icon = t.icon;
  return (
    <div
      className={cn("grid place-items-center", className)}
      style={{ background: `linear-gradient(150deg, ${t.from}, ${t.to})` }}
    >
      <Icon className={cn("text-white/80", iconClassName)} strokeWidth={1.4} />
    </div>
  );
}
