"use client";

import { ArrowLeft, Clock, Link2, Palette } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sticker } from "@/components/story/stickers";
import { Logo } from "@/components/ui/logo";
import { canGoBackInApp } from "@/lib/nav-history";
import { useUser } from "@/lib/supabase/browser";
import { SignInOptions } from "./sign-in-options";

const perks = [
  { icon: Palette, text: "Pick a design made for the moment" },
  { icon: Clock, text: "Make it yours in about a minute" },
  { icon: Link2, text: "Send a private link that opens on any phone" },
];

/**
 * The sign-in page: the ways in on the left; on wide screens, a few real
 * gifts on the right. Phones get just the left side.
 */
export function SignInScreen({ next = "/profile" }: { next?: string }) {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  return (
    <main className="min-h-svh bg-cream lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-6 lg:p-4">
      {/* ── The ways in ── */}
      <section className="mx-auto flex min-h-svh w-full max-w-md flex-col px-6 pb-8 pt-6 lg:min-h-0 lg:py-6">
        <div className="flex items-center justify-between">
          <Logo className="text-[1.7rem]" />
          <Link
            href="/"
            onClick={(e) => {
              if (canGoBackInApp()) {
                e.preventDefault();
                router.back();
              }
            }}
            className="flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink"
          >
            <ArrowLeft className="size-4" /> Back
          </Link>
        </div>

        <div className="my-auto pt-14 lg:pt-0">
          <p className="text-sm text-ink/55">Welcome to TyniTales</p>
          <h1 className="type-display mt-2 text-[clamp(2.4rem,9vw,3.4rem)] leading-[1.02]">
            Come on <span className="type-accent text-rose">in.</span>
          </h1>
          <p className="mt-4 inline-flex rounded-full bg-blush/60 px-3.5 py-1.5 text-sm text-rose-deep">Free to try · no password needed</p>

          <SignInOptions disabled={user === undefined} className="mt-8" />

          <ul className="mt-10 space-y-3.5 border-t border-line pt-8">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3.5 text-[15px]">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-paper text-rose">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-10 text-xs leading-relaxed text-ink/45">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-ink">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
            Privacy policy
          </Link>
          .
        </p>
      </section>

      {/* ── A few real gifts (wide screens only) ── */}
      <aside aria-hidden className="relative hidden overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,#fbe4e1_0%,#f8efe6_55%,#f3e2d3_100%)] lg:block">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgb(27_18_21/0.06)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="relative flex h-full flex-col items-center justify-center px-10">
          <p className="type-display text-center text-[clamp(2.2rem,3.4vw,3.4rem)] leading-[1.05]">
            Little gifts,
            <br />
            <span className="type-accent text-rose">big feelings.</span>
          </p>

          <div className="relative mt-12 h-[440px] w-[460px]">
            <Phone src="/showcase/little-sorry.webp" className="left-0 top-10 -rotate-[9deg]" />
            <Phone src="/showcase/make-a-wish.webp" className="right-0 top-10 rotate-[9deg]" />
            <Phone src="/showcase/sealed-with-love.webp" className="left-1/2 top-0 z-10 -translate-x-1/2" front />
            <div className="absolute -left-6 bottom-6 z-20 size-20 rotate-[-8deg]">
              <Sticker id="b-capy-kiss" className="size-full" still />
            </div>
            <div className="absolute -right-4 top-0 z-20 size-16 rotate-[10deg]">
              <Sticker id="m-flower-kitten" className="size-full" still />
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-ink/55">For birthdays, sorrys, anniversaries and every “just because”.</p>
        </div>
      </aside>
    </main>
  );
}

function Phone({ src, className, front }: { src: string; className: string; front?: boolean }) {
  return (
    <div
      className={`absolute h-[400px] w-[185px] overflow-hidden rounded-[1.9rem] border-[5px] border-[#fdfbf8] bg-[#fdfbf8] ring-1 ring-ink/10 ${
        front ? "shadow-[0_34px_60px_-26px_rgba(27,18,21,0.45)]" : "shadow-[0_24px_44px_-26px_rgba(27,18,21,0.3)]"
      } ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={750} height={1624} className="size-full rounded-[1.5rem] object-cover object-top" />
    </div>
  );
}
