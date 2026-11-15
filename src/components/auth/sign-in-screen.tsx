"use client";

import { ArrowLeft, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "@/components/ui/logo";
import { canGoBackInApp } from "@/lib/nav-history";
import { useUser } from "@/lib/supabase/browser";
import { SignInOptions } from "./sign-in-options";

/**
 * The film on the right (wide screens only). Drop the file in
 * public/sign-in/ and set its name here; until then a soft placeholder shows.
 * Keep it short (5 to 10 s), muted, and small: ideally an MP4 under ~3 MB.
 */
const VIDEO: { src: string; poster?: string } | null = null;

/**
 * The sign-in page. Phones: just the ways in. Wide screens: the ways in on the
 * left, a short film of real people on the right.
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

      {/* ── The film (wide screens only) ── */}
      <aside aria-hidden className="relative hidden overflow-hidden rounded-[1.75rem] bg-[linear-gradient(160deg,#f6d3cf_0%,#f3e4dc_50%,#e9d3c3_100%)] lg:block">
        {VIDEO ? (
          <video
            className="absolute inset-0 size-full object-cover"
            src={VIDEO.src}
            poster={VIDEO.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center gap-3 text-ink/35">
              <span className="grid size-14 place-items-center rounded-full border border-ink/15 bg-white/40 backdrop-blur-sm">
                <Play className="ml-0.5 size-5 fill-current" />
              </span>
              <span className="text-xs uppercase tracking-[0.2em]">Video goes here</span>
            </div>
          </div>
        )}

        {/* A soft shade at the foot so the words read over any video. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-10 xl:p-12">
          <p className="type-display max-w-md text-[clamp(2.2rem,3.2vw,3.2rem)] leading-[1.04] text-white">
            Little gifts, <span className="type-accent">big feelings.</span>
          </p>
          <p className="mt-3 text-sm text-white/75">Birthdays, sorrys, anniversaries and every “just because”.</p>
        </div>
      </aside>
    </main>
  );
}
