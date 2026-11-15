"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sticker } from "@/components/story/stickers";
import { Logo } from "@/components/ui/logo";
import { canGoBackInApp } from "@/lib/nav-history";
import { useUser } from "@/lib/supabase/browser";
import { SignInOptions } from "./sign-in-options";

/**
 * Stickers scattered round the headline: where (percent of the room left, so 0
 * is the left or top edge and 100 the right or bottom), how big, how tilted.
 */
const WALL: { id: string; x: number; y: number; size: number; tilt: number }[] = [
  { id: "m-dance-cat", x: 6, y: 6, size: 132, tilt: -8 },
  { id: "b-capy-kiss", x: 38, y: 4, size: 96, tilt: 6 },
  { id: "m-heart-eyes", x: 70, y: 5, size: 118, tilt: -4 },
  { id: "b-cake", x: 94, y: 24, size: 90, tilt: 10 },
  { id: "m-shy-monkey", x: 4, y: 40, size: 104, tilt: 7 },
  { id: "b-love-duck", x: 96, y: 50, size: 96, tilt: -9 },
  { id: "m-scream-cat", x: 6, y: 84, size: 120, tilt: -6 },
  { id: "m-flower-kitten", x: 34, y: 94, size: 104, tilt: 5 },
  { id: "b-frog-kiss", x: 62, y: 88, size: 92, tilt: -7 },
  { id: "m-penguin", x: 90, y: 92, size: 112, tilt: 8 },
  { id: "b-ring", x: 60, y: 26, size: 64, tilt: -12 },
  { id: "m-kuchu-puchu", x: 24, y: 22, size: 72, tilt: 11 },
];

/** Little meme captions stuck between the stickers. */
const CAPTIONS: { text: string; x: number; y: number; tilt: number }[] = [
  { text: "sent at 12:00:00 am. sharp.", x: 12, y: 60, tilt: -4 },
  { text: "them: 🥹🥹🥹", x: 62, y: 64, tilt: 5 },
  { text: "pov: it’s actually personal", x: 46, y: 16, tilt: -3 },
];

/**
 * The sign-in page. Phones: just the ways in. Wide screens: the ways in on the
 * left, a wall of our stickers on the right.
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

      {/* ── A wall of stickers (wide screens only) ── */}
      <StickerWall />
    </main>
  );
}

/** The right-hand panel: our stickers stuck all over, with the line in the middle. */
function StickerWall() {
  return (
    <aside aria-hidden className="relative hidden overflow-hidden rounded-[1.75rem] bg-[linear-gradient(160deg,#fbe1dd_0%,#f9ece4_50%,#f4e0d2_100%)] lg:block">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgb(27_18_21/0.07)_1px,transparent_1px)] [background-size:22px_22px]" />

      {WALL.map((s, i) => (
        <div key={s.id} className="absolute" style={{ left: `calc(${s.x}% - ${(s.size * s.x) / 100}px)`, top: `calc(${s.y}% - ${(s.size * s.y) / 100}px)`, width: s.size, height: s.size, rotate: `${s.tilt}deg` }}>
          <div
            className="tt-loop size-full rounded-[22%] bg-white p-[7%] shadow-[0_14px_28px_-14px_rgba(27,18,21,0.45)]"
            style={{ animation: `tt-bob ${4 + (i % 3)}s ease-in-out ${-i * 0.7}s infinite` }}
          >
            <Sticker id={s.id} className="size-full" />
          </div>
        </div>
      ))}

      {CAPTIONS.map((c) => (
        <p
          key={c.text}
          className="absolute whitespace-nowrap rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-medium text-paper shadow-[0_10px_20px_-10px_rgba(27,18,21,0.6)]"
          style={{ left: `${c.x}%`, top: `${c.y}%`, rotate: `${c.tilt}deg` }}
        >
          {c.text}
        </p>
      ))}

      <div className="absolute inset-0 grid place-items-center">
        <p className="type-display rounded-[2rem] bg-cream/80 px-10 py-7 text-center text-[clamp(2.2rem,3.2vw,3.2rem)] leading-[1.04] shadow-[0_20px_40px_-24px_rgba(27,18,21,0.35)] backdrop-blur-sm">
          Little gifts,
          <br />
          <span className="type-accent text-rose">big feelings.</span>
        </p>
      </div>
    </aside>
  );
}
