"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "@/components/ui/logo";
import { canGoBackInApp } from "@/lib/nav-history";
import { useUser } from "@/lib/supabase/browser";
import { SignInOptions } from "./sign-in-options";

/**
 * The picture on the right (wide screens only). Put the file in public/sign-in/
 * and set its path here; until then a soft blush panel shows.
 */
const PICTURE: string | null = "/sign-in/cat.webp";

/**
 * The sign-in page. Phones: just the ways in. Wide screens: the ways in on the
 * left, a picture on the right.
 */
export function SignInScreen({ next = "/profile" }: { next?: string }) {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  return (
    <main className="min-h-svh bg-cream lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:p-3">
      {/* ── The ways in ── */}
      <section className="flex min-h-svh flex-col px-6 py-6 sm:px-10 lg:min-h-0">
        <header className="flex items-center justify-between">
          <Logo className="text-[1.6rem]" />
          <Link
            href="/"
            onClick={(e) => {
              if (canGoBackInApp()) {
                e.preventDefault();
                router.back();
              }
            }}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-ink/55 transition-colors hover:bg-paper hover:text-ink"
          >
            <ArrowLeft className="size-3.5" /> Back
          </Link>
        </header>

        <div className="mx-auto my-auto w-full max-w-[360px] py-12">
          <h1 className="type-display text-[2.6rem] leading-[1.02] sm:text-5xl">
            Welcome <span className="type-accent text-rose">in.</span>
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink/55">New here or back again, it’s the same quick step. No password.</p>

          <SignInOptions disabled={user === undefined} className="mt-9" />
        </div>

        <p className="mx-auto w-full max-w-[360px] text-center text-xs leading-relaxed text-ink/40">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline decoration-ink/20 underline-offset-2 hover:text-ink">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline decoration-ink/20 underline-offset-2 hover:text-ink">
            Privacy policy
          </Link>
          .
        </p>
      </section>

      {/* ── A picture (wide screens only) ── */}
      <PicturePanel />
    </main>
  );
}

/** The right-hand panel: one picture, edge to edge, with the line over a soft shade. */
function PicturePanel() {
  return (
    <aside aria-hidden className="relative hidden overflow-hidden rounded-[1.75rem] bg-[linear-gradient(160deg,#fbe1dd_0%,#f9ece4_50%,#f4e0d2_100%)] lg:block">
      {PICTURE && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={PICTURE} alt="" className="absolute inset-0 size-full object-cover object-[50%_30%]" />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-10 xl:p-12">
        <p className="type-display max-w-md text-[clamp(2.2rem,3.2vw,3.2rem)] leading-[1.04] text-white">
          Little gifts, <span className="type-accent">big feelings.</span>
        </p>
      </div>
    </aside>
  );
}
