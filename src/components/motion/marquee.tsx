import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type MarqueeProps = {
  children: ReactNode;
  reverse?: boolean;
  /** Seconds for one full loop. */
  duration?: number;
  className?: string;
  /** Fade the left and right edges into the page. On by default. */
  fade?: boolean;
};

/** Pure-CSS infinite marquee with edge fade; pauses on hover. */
export function Marquee({ children, reverse, duration = 40, className, fade = true }: MarqueeProps) {
  return (
    <div
      className={cn(
        "group flex overflow-hidden",
        fade && "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
      style={{ "--duration": `${duration}s` } as CSSProperties}
    >
      <div
        className={cn(
          "flex w-max shrink-0 animate-marquee group-hover:[animation-play-state:paused]",
          reverse && "[animation-direction:reverse]",
        )}
      >
        <div className="flex shrink-0 gap-5 pr-5">{children}</div>
        <div aria-hidden className="flex shrink-0 gap-5 pr-5">
          {children}
        </div>
      </div>
    </div>
  );
}
