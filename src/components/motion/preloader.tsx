"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { EASE_IN_OUT, EASE_OUT, INTRO_DELAY } from "@/lib/motion";

/** Brief branded curtain on first paint of the home page. */
export function Preloader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), (INTRO_DELAY - 0.15) * 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          aria-hidden
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink text-cream"
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.9, ease: EASE_IN_OUT }}
        >
          <div className="type-wordmark flex items-baseline text-[clamp(3.5rem,13vw,9rem)] leading-none">
            {Array.from("TyniTales").map((c, i) => (
              <span key={i} className="inline-block overflow-y-clip pr-[0.04em] pb-[0.22em]">
                <motion.span
                  className="inline-block"
                  initial={{ y: "115%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.1 + i * 0.06 }}
                >
                  {c}
                </motion.span>
              </span>
            ))}
            <motion.span
              className="ml-1 inline-block size-[0.12em] rounded-full bg-rose"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 1] }}
              transition={{ delay: 0.65, duration: 0.5 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
