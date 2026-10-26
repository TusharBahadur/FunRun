"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { siteConfig } from "@/config/site";
import { peekSignedInUser, type PeekedUser } from "@/lib/session-peek";
import { EASE_IN_OUT, EASE_OUT, INTRO_DELAY } from "@/lib/motion";
import { cn } from "@/lib/utils";

const menuItems = [{ label: "Home", href: "/" }, ...siteConfig.nav];

export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<PeekedUser | null>(null);

  // Signed in? Read from saved session so marketing pages don't load the auth library.
  useEffect(() => {
    const refresh = () => setMe(peekSignedInUser());
    const id = setTimeout(refresh, 0);
    window.addEventListener("tynitales:auth", refresh);
    window.addEventListener("storage", refresh); // signed in or out in another tab
    return () => {
      clearTimeout(id);
      window.removeEventListener("tynitales:auth", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [pathname]);

  useMotionValueEvent(scrollY, "change", (v) => {
    setScrolled(v > 24);
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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
        {/* Always on screen: it stays put while the page scrolls. */}
        <div className="mx-auto max-w-7xl px-3 pt-3 sm:px-5">
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
              className={cn("transition-colors duration-500", open && "text-cream md:text-ink")}
            />

            {/* Wide screens: every page is one click away, no menu needed. */}
            <ul className="hidden items-center gap-1 lg:flex">
              {menuItems
                .filter((item) => item.href !== "/profile")
                .map((item) => {
                  const active = item.href === pathname;
                  return (
                    <li key={item.href}>
                      <Link
                        href={resolve(item.href)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "relative rounded-full px-3.5 py-2 text-sm transition-colors duration-300",
                          active ? "text-ink" : "text-ink/65 hover:text-ink",
                        )}
                      >
                        {item.label}
                        {active && <span aria-hidden className="absolute inset-x-3.5 -bottom-0.5 h-px bg-rose" />}
                      </Link>
                    </li>
                  );
                })}
            </ul>

            <div className="flex items-center gap-2">
              <ButtonLink
                href="/templates"
                size="sm"
                className={cn("hidden transition-opacity sm:inline-flex", open && "pointer-events-none opacity-0")}
              >
                Start gifting
              </ButtonLink>
              {!me && (
                <Link href="/sign-in" className="hidden h-10 items-center rounded-full px-3.5 text-sm text-ink/65 transition-colors hover:text-ink lg:inline-flex">
                  Sign in
                </Link>
              )}
              {me && (
                <Link
                  href="/profile"
                  aria-label="Your profile"
                  title={me.name ?? "Your profile"}
                  className={cn(
                    "grid size-10 place-items-center overflow-hidden rounded-full border border-ink/10 bg-wine text-sm font-semibold text-cream transition-opacity",
                    open && "pointer-events-none opacity-0",
                  )}
                >
                  {me.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={me.avatar} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
                  ) : (
                    (me.name ?? me.email ?? "?").slice(0, 1).toUpperCase()
                  )}
                </Link>
              )}
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="site-menu"
                className={cn(
                  "type-label flex h-10 items-center gap-3 rounded-full border pl-4 pr-3.5 backdrop-blur-xl transition-colors duration-500 lg:hidden",
                  open
                    ? "border-cream/15 bg-cream/10 text-cream"
                    : "border-ink/10 bg-paper/70 text-ink hover:bg-paper",
                )}
              >
                Menu
                <MenuGlyph open={open} />
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <>
            {/* The page stays visible behind, softly blurred. */}
            <motion.button
              key="scrim"
              type="button"
              aria-label="Close menu"
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 cursor-default bg-ink/15 backdrop-blur-[3px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />

            <motion.aside
              key="panel"
              id="site-menu"
              aria-label="Site menu"
              data-lenis-prevent
              className="fixed inset-2 z-40 flex flex-col overflow-hidden rounded-[1.75rem] border border-cream/10 bg-ink/75 px-7 pb-8 pt-28 text-cream shadow-[0_0_80px_-20px_rgba(27,18,21,0.6)] backdrop-blur-2xl md:inset-y-0 md:left-auto md:right-0 md:w-[min(36vw,560px)] md:min-w-[420px] md:rounded-none md:border-y-0 md:border-r-0 md:px-12"
              initial={{ x: "105%" }}
              animate={{ x: "0%" }}
              exit={{ x: "105%" }}
              transition={{ duration: 0.75, ease: EASE_IN_OUT }}
            >
              {/* Soft colour wash so the glass reads as tinted, not flat. */}
              <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[30rem] rounded-full bg-[radial-gradient(closest-side,rgb(226_59_84/0.35),transparent)]" />
              <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 size-[28rem] rounded-full bg-[radial-gradient(closest-side,rgb(90_26_43/0.6),transparent)]" />

              {/* A size container: menu words scale to the panel, so the longest one always fits. */}
              <nav className="@container relative flex flex-1 flex-col justify-center">
                <ul className="flex flex-col items-end text-right">
                  {menuItems.map((item, i) => {
                    const active = item.href === pathname;
                    return (
                      <li key={item.href} className="overflow-hidden">
                        <motion.div
                          initial={{ y: "105%" }}
                          animate={{ y: "0%" }}
                          exit={{ y: "105%", transition: { duration: 0.3, ease: EASE_IN_OUT } }}
                          transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.25 + i * 0.06 }}
                        >
                          <Link
                            href={resolve(item.href)}
                            onClick={() => setOpen(false)}
                            className="group flex items-baseline justify-end gap-4 py-0.5"
                          >
                            <span className="type-label text-[10px] text-cream/35 transition-colors group-hover:text-rose">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span
                              className={cn(
                                "whitespace-nowrap font-serif text-[min(4.75rem,12cqi)] uppercase leading-[0.92] tracking-[-0.01em] transition-colors duration-300 group-hover:text-blush",
                                active ? "text-blush" : "text-cream",
                              )}
                            >
                              {item.label}
                            </span>
                          </Link>
                        </motion.div>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <motion.div
                className="relative flex flex-col items-end gap-2.5 border-t border-cream/10 pt-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Link
                  href="/templates"
                  onClick={() => setOpen(false)}
                  className="type-label flex items-center gap-2 text-cream/80 hover:text-cream"
                >
                  <ArrowUpRight className="size-3.5" /> Start gifting
                </Link>
                <Link
                  href={me ? "/profile" : "/sign-in"}
                  onClick={() => setOpen(false)}
                  className="type-label flex items-center gap-2 text-cream/80 hover:text-cream"
                >
                  <UserRound className="size-3.5" /> {me ? "Your profile" : "Sign in"}
                </Link>
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/** Four dots that fold into an ×. */
function MenuGlyph({ open }: { open: boolean }) {
  const dots = [
    [0, -4],
    [4, 0],
    [0, 4],
    [-4, 0],
  ];
  return (
    <span className="relative grid size-3.5 place-items-center" aria-hidden>
      {dots.map(([x, y], i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-current"
          initial={false}
          animate={
            open
              ? { x: 0, y: 0, width: 14, height: 1.5, rotate: i % 2 ? -45 : 45, opacity: i < 2 ? 1 : 0 }
              : { x, y, width: 2.5, height: 2.5, rotate: 0, opacity: 1 }
          }
          transition={{ duration: 0.45, ease: EASE_OUT }}
        />
      ))}
    </span>
  );
}
