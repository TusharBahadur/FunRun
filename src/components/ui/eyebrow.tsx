import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Small editorial label above section headings, e.g. "(02) — How it works". */
export function Eyebrow({
  index,
  children,
  className,
}: {
  index?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 type-label text-muted",
        className,
      )}
    >
      {index && <span>({index})</span>}
      <span className="h-px w-8 bg-current opacity-40" />
      {children}
    </p>
  );
}
