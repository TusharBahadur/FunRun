"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { canGoBackInApp } from "@/lib/nav-history";

/**
 * The back button on a template preview. It goes back to wherever you came
 * from (the listing, the home page, or the template's page), landing where you
 * were. Only when the preview was opened directly does it go to the template's page.
 */
export function PreviewBack({ fallback, className, style }: { fallback: string; className?: string; style?: CSSProperties }) {
  const router = useRouter();
  return (
    <a
      href={fallback}
      onClick={(e) => {
        if (canGoBackInApp()) {
          e.preventDefault();
          router.back();
        }
      }}
      className={className}
      style={style}
    >
      <ArrowLeft className="size-4" /> Back
    </a>
  );
}
