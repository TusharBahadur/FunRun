"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { RollText } from "@/components/ui/roll-text";
import { siteConfig } from "@/config/site";
import { EASE_IN_OUT, EASE_OUT, INTRO_DELAY } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(v > prev && v > 240);
    setScrolled(v > 24);
  });

  // On the home page, use bare hashes so smooth-scroll handles them.
  const resolve = (href: string) =>
    pathname === "/" && href.startsWith("/#") ? href.slice(1) : href;

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE_OUT, delay: pathname === "/" ? INTRO_DELAY : 0 }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <motion.div
          animate={{ y: hidden && !open ? "-130%" : "0%" }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="mx-auto max-w-7xl px-3 pt-3 sm:px-5"
        >
          <nav
            className={cn(
              "flex items-center justify-between rounded-full border transition-all duration-500 ease-out-expo",
              scrolled && !open
                ? "border-ink/6 bg-paper/70 py-1.5 pl-5 pr-1.5 shadow-[0_8px_30px_-12px_rgba(27,18,21,0.25)] backdrop-blur-xl"
                : "border-transparent py-2.5 pl-2 pr-0",
            )}
          >
            <Logo
              onClick={() => setOpen(false)}
              className={cn("transition-colors duration-500", open && "text-cream")}
            />

            <ul className="hidden items-center md:flex">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={resolve(item.href)}
                    className="group block rounded-full px-4 py-2 text-sm text-ink/70 transition-colors hover:text-ink"
                  >
                    <RollText>{item.label}</RollText>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1.5">
              <Link
                href="/sign-in"
                className="group hidden rounded-full px-4 py-2 text-sm text-ink/70 hover:text-ink sm:block"
              >
                <RollText>Sign in</RollText>
              </Link>
              <ButtonLink href="/templates" size="sm" className="hidden sm:inline-flex">
                Start gifting
              </ButtonLink>
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                className={cn(
                  "relative grid size-11 place-items-center rounded-full transition-colors duration-500 md:hidden",
                  open ? "bg-cream text-ink" : "bg-ink text-paper",
                )}
              >
                <motion.span
                  className="absolute h-[1.5px] w-4 rounded-full bg-current"
                  animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -3 }}
                />
                <motion.span
                  className="absolute h-[1.5px] w-4 rounded-full bg-current"
                  animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 3 }}
                />
              </button>
            </div>
          </nav>
        </motion.div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-between bg-ink px-6 pb-10 pt-32 text-cream md:hidden"
            initial={{ clipPath: "circle(0% at calc(100% - 2.6rem) 2.6rem)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 2.6rem) 2.6rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 2.6rem) 2.6rem)" }}
            transition={{ duration: 0.8, ease: EASE_IN_OUT }}
          >
            <ul className="flex flex-col gap-2">
              {[...siteConfig.nav, { label: "Sign in", href: "/sign-in" }].map((item, i) => (
                <li key={item.href} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.25 + i * 0.06 }}
                  >
                    <Link
                      href={resolve(item.href)}
                      onClick={() => setOpen(false)}
                      className="block font-serif text-5xl italic leading-tight"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <ButtonLink
                href="/templates"
                variant="rose"
                size="lg"
                className="w-full justify-between"
                onClick={() => setOpen(false)}
              >
                Start gifting
              </ButtonLink>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
