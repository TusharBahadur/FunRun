"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

type Variant = "default" | "hover" | "view";

const variants = {
  default: { scale: 0.14, backgroundColor: "rgba(226,59,84,1)" },
  hover: { scale: 0.5, backgroundColor: "rgba(226,59,84,0.18)" },
  view: { scale: 1, backgroundColor: "rgba(226,59,84,1)" },
};

/** Trailing dot that grows over links and becomes a "View" bubble on cards. */
export function Cursor() {
  // The studio is a precise editing tool: keep the plain system cursor there.
  const inStudio = usePathname().startsWith("/studio");
  const enabled = useMediaQuery("(pointer: fine)") && !inStudio;
  const [variant, setVariant] = useState<Variant>("default");
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const spring = { stiffness: 500, damping: 40, mass: 0.5 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = (e.target as Element | null)?.closest?.("[data-cursor], a, button");
      setVariant(
        !target ? "default" : target.getAttribute("data-cursor") === "view" ? "view" : "hover",
      );
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90]"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className="-translate-x-1/2 -translate-y-1/2 grid size-[88px] place-items-center rounded-full text-[13px] font-medium text-paper"
        animate={variants[variant]}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        <motion.span animate={{ opacity: variant === "view" ? 1 : 0 }}>View</motion.span>
      </motion.div>
    </motion.div>
  );
}
