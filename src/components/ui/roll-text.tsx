import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Text that rolls up to a duplicate on hover. Needs a `group` ancestor. */
export function RollText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("relative inline-flex overflow-hidden", className)}>
      <span className="transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 translate-y-full transition-transform duration-500 ease-out-expo group-hover:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}
