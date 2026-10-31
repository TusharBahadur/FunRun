"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { siteConfig } from "@/config/site";
import { peekSignedInUser, type PeekedUser } from "@/lib/session-peek";
import { EASE_OUT, INTRO_DELAY } from "@/lib/motion";
import { cn } from "@/lib/utils";

const menuItems = [{ label: "Home", href: "/" }, ...siteConfig.nav];

/**
 * The navbar reads the URL (to highlight the page you're on). Pages whose URL
 * isn't known at build time (like /sent/[slug]) can't read it while
 * prerendering, so those get the same navbar without the highlight first,
 * and the real one as soon as the page loads.
 */
export function Navbar() {
  return (
    <Suspense fallback={<NavbarView pathname={null} />}>
      <NavbarAtPath />
    </Suspense>
  );
}

function NavbarAtPath() {
  return <NavbarView pathname={usePathname()} />;
}

function NavbarView({ pathname }: { pathname: string | null }) {
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
                ? // Live blur only on larger screens: on phones it re-blurs the moving page every frame while scrolling.
                  "border-ink/6 bg-paper/95 py-1.5 pl-5 pr-1.5 shadow-[0_8px_30px_-12px_rgba(27,18,21,0.25)] md:bg-paper/70 md:backdrop-blur-xl"
                : "border-transparent py-2.5 pl-2 pr-0",
            )}
          >
            <Logo
              onClick={() => setOpen(false)}
              className="transition-colors duration-500"
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
                    // Only on desktop, where there's no menu. Phones and tablets
                    // reach the profile from inside the menu.
                    "hidden size-10 place-items-center overflow-hidden rounded-full border border-ink/10 bg-wine text-sm font-semibold text-cream transition-opacity lg:grid",
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
                  "type-label flex h-10 items-center gap-3 rounded-full border pl-4 pr-3.5 transition-colors duration-500 md:backdrop-blur-xl lg:hidden",
                  open ? "border-ink/15 bg-paper text-ink" : "border-ink/10 bg-paper/90 text-ink hover:bg-paper md:bg-paper/70",
                )}
              >
                Menu
                <MenuGlyph open={open} />
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* The menu (phones and tablets): a plain card under the header, on the
          site's own paper. No slide or staggered letters: it opens instantly,
          which is what makes it feel fast on a phone. */}
      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-ink/20"
          />
          <div
            id="site-menu"
            role="dialog"
            aria-label="Site menu"
            data-lenis-prevent
            className="fixed inset-x-3 top-[4.5rem] z-40 rounded-[1.75rem] border border-line bg-paper p-3 shadow-[0_24px_60px_-24px_rgba(27,18,21,0.45)] sm:inset-x-5 md:left-auto md:w-96"
          >
            <nav>
              <ul className="flex flex-col">
                {/* Profile / Sign in is the button at the bottom. */}
                {menuItems.filter((item) => item.href !== "/profile").map((item) => {
                  const active = item.href === pathname;
                  return (
                    <li key={item.href}>
                      <Link
                        href={resolve(item.href)}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between rounded-2xl px-4 py-3.5 text-lg font-medium transition-colors",
                          active ? "bg-blush/60 text-rose-deep" : "text-ink hover:bg-cream",
                        )}
                      >
                        {item.label}
                        <ArrowUpRight className={cn("size-4", active ? "text-rose-deep" : "text-ink/30")} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="mt-2 flex items-center gap-2 border-t border-line px-1 pt-3">
              <Link href="/templates" onClick={() => setOpen(false)} className="btn btn-rose h-11 flex-1 text-sm">
                Start gifting
              </Link>
              <Link
                href={me ? "/profile" : "/sign-in"}
                onClick={() => setOpen(false)}
                className="btn btn-paper h-11 gap-1.5 px-4 text-sm"
              >
                <UserRound className="size-4" /> {me ? "Profile" : "Sign in"}
              </Link>
            </div>
          </div>
        </>
      )}
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
