"use client";

import { AnimatePresence, motion, useDragControls } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

/**
 * One modal for every screen size. On phones it is a bottom sheet: full width,
 * rises from the bottom edge, and can be pulled down by its handle to close.
 * On bigger screens it is a centred card.
 */
export function Sheet({
  open,
  onClose,
  label,
  labelledBy,
  locked = false,
  scroll = true,
  z = 80,
  width = "w-[min(96vw,540px)]",
  className,
  onOpened,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label?: string;
  labelledBy?: string;
  /** While true (say, mid-payment) it can't be dismissed. */
  locked?: boolean;
  /** false when the content lays out its own scrolling areas. */
  scroll?: boolean;
  z?: number;
  /** Width of the centred card on bigger screens. */
  width?: string;
  /** Extra classes for the panel, e.g. a fixed height. */
  className?: string;
  onOpened?: () => void;
  children: ReactNode;
}) {
  const phone = useMediaQuery("(max-width: 639px)");
  const drag = useDragControls();

  useEffect(() => {
    if (!open || locked) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, locked, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={cn("fixed inset-0 flex justify-center", phone ? "items-end" : "items-center p-4")}
          style={{ zIndex: z }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" onClick={locked ? undefined : onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            aria-labelledby={labelledBy}
            data-lenis-prevent
            className={cn(
              "relative flex flex-col overflow-hidden bg-cream shadow-float",
              phone
                ? "max-h-[92svh] w-full rounded-t-[1.75rem] pb-[env(safe-area-inset-bottom,0px)]"
                : cn("max-h-[90vh] rounded-[1.6rem]", width),
              className,
            )}
            initial={phone ? { y: "100%" } : { y: 20, scale: 0.98, opacity: 0 }}
            animate={phone ? { y: 0 } : { y: 0, scale: 1, opacity: 1 }}
            exit={phone ? { y: "100%" } : { y: 20, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            drag={phone && !locked ? "y" : false}
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose();
            }}
            onAnimationComplete={onOpened}
          >
            {phone && (
              <div
                onPointerDown={(e) => !locked && drag.start(e)}
                className="flex shrink-0 cursor-grab touch-none justify-center pb-1 pt-2.5"
                aria-hidden
              >
                <span className="h-1.5 w-10 rounded-full bg-ink/15" />
              </div>
            )}
            {scroll ? <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div> : children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
