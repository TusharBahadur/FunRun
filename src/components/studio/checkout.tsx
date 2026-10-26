"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Clock, Copy, ExternalLink, Loader2, Lock, Share2, X } from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { storyFacts } from "@/components/story/labels";
import { giftPricing } from "@/config/site";
import { expiryFor, formatDay, giftPath, slugifyName } from "@/lib/gift-links";
import { signInWithGoogle, useUser } from "@/lib/supabase/browser";
import { cn, formatInr } from "@/lib/utils";
import { markOwnGift } from "@/components/gift/open-beacon";
import { GoogleMark } from "@/components/profile/sign-in-card";
import type { Draft } from "./draft-store";
import { NeedsSignIn, publishGift } from "./publish";

/** Remembers the checkout choices across the trip to Google sign-in and back. */
const pendingKey = (draftId: string) => `tynitales:publish:${draftId}`;
type Pending = { link: string; when: "now" | "later"; unlockAt: string; confirmed: boolean };

export function hasPendingPublish(draftId: string) {
  try {
    return sessionStorage.getItem(pendingKey(draftId)) !== null;
  } catch {
    return false;
  }
}

function readPending(draftId: string): Pending | null {
  try {
    const raw = sessionStorage.getItem(pendingKey(draftId));
    return raw ? (JSON.parse(raw) as Pending) : null;
  } catch {
    return null;
  }
}

function writePending(draftId: string, p: Pending | null) {
  try {
    if (p) sessionStorage.setItem(pendingKey(draftId), JSON.stringify(p));
    else sessionStorage.removeItem(pendingKey(draftId));
  } catch {
    /* private mode: they'll just re-pick their options */
  }
}

/**
 * "Make it live": sign in with Google, upload the photos, save the gift and
 * hand back a link to share. Payments aren't connected yet, so it's free.
 */
export function Checkout({
  open,
  onClose,
  draft,
  templateSlug,
  templateName,
  pricePaise,
  onPublished,
}: {
  open: boolean;
  onClose: () => void;
  draft: Draft;
  templateSlug: string;
  templateName: string;
  pricePaise: number;
  onPublished: (live: NonNullable<Draft["live"]>) => void;
}) {
  const user = useUser();
  const [link, setLink] = useState(() => slugifyName(draft.story.recipient) || "for-you");
  const [when, setWhen] = useState<"now" | "later">("now");
  const [unlockAt, setUnlockAt] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState<null | { done: number; total: number }>(null);
  const [error, setError] = useState<string | null>(null);
  const facts = storyFacts(draft.story.scenes.filter((s) => !s.hidden));
  const live = draft.live?.slug ? draft.live : null;

  // Back from Google: put their choices back exactly as they left them.
  useEffect(() => {
    if (!open) return;
    const p = readPending(draft.id);
    if (!p) return;
    const id = setTimeout(() => {
      setLink(p.link);
      setWhen(p.when);
      setUnlockAt(p.unlockAt);
      setConfirmed(p.confirmed);
    }, 0);
    return () => clearTimeout(id);
  }, [open, draft.id]);

  const scheduled = when === "later" && unlockAt ? new Date(unlockAt) : null;
  const opens = scheduled && scheduled > new Date() ? scheduled : new Date();
  const laterMissing = when === "later" && !unlockAt;

  async function signIn() {
    setError(null);
    writePending(draft.id, { link, when, unlockAt, confirmed });
    try {
      await signInWithGoogle();
    } catch {
      setError("Couldn't open Google sign-in. Please try again.");
    }
  }

  async function publish() {
    setError(null);
    setBusy({ done: 0, total: 0 });
    try {
      const result = await publishGift({
        templateSlug,
        name: draft.name,
        story: draft.story,
        link: link || draft.story.recipient,
        unlockAt: scheduled ? scheduled.toISOString() : undefined,
        onProgress: (done, total) => setBusy({ done, total }),
      });
      writePending(draft.id, null);
      markOwnGift(result.slug);
      onPublished({
        link: result.slug,
        slug: result.slug,
        unlockAt: scheduled ? result.unlockAt : undefined,
        expiresAt: result.expiresAt,
        publishedAt: new Date().toISOString(),
        paid: false,
      });
    } catch (e) {
      if (e instanceof NeedsSignIn) await signIn();
      else setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center bg-ink/30 p-4 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={busy ? undefined : onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Make it live"
            data-lenis-prevent
            className="max-h-[92vh] w-[min(96vw,540px)] overflow-y-auto rounded-[1.6rem] bg-cream shadow-float"
            initial={{ y: 20, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 20, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-6 pt-5">
              <div>
                <p className="type-label text-[10px] text-muted">{live ? "Your gift is live" : "Last step"}</p>
                <h2 className="type-display mt-1 text-3xl">
                  {live ? (
                    <>
                      It’s <span className="type-accent text-rose">ready.</span>
                    </>
                  ) : (
                    <>
                      Make it <span className="type-accent text-rose">live.</span>
                    </>
                  )}
                </h2>
              </div>
              <button type="button" onClick={onClose} disabled={!!busy} aria-label="Close" className="grid size-8 place-items-center rounded-lg hover:bg-paper disabled:opacity-30">
                <X className="size-4" />
              </button>
            </div>

            {live ? (
              <ShareLink slug={live.slug!} unlockAt={live.unlockAt} expiresAt={live.expiresAt} recipient={draft.story.recipient} />
            ) : (
              <div className="space-y-6 px-6 pb-6 pt-5">
                <section>
                  <p className="mb-2 text-sm font-semibold">Your link</p>
                  <label className="flex items-center rounded-2xl border border-line bg-paper px-4 py-3 text-[15px] focus-within:border-ink/40">
                    <span className="text-muted">tynitales.gift/for/</span>
                    <input
                      value={link}
                      onChange={(e) => setLink(slugifyName(e.target.value))}
                      className="min-w-0 flex-1 bg-transparent outline-none"
                      aria-label="Link name"
                    />
                    <span className="text-muted">-xxxxxx</span>
                  </label>
                  <p className="mt-1.5 text-xs text-muted">We add 6 random characters so only people you send it to can open it.</p>
                </section>

                <section>
                  <p className="mb-2 text-sm font-semibold">When can they open it?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["now", "later"] as const).map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setWhen(w)}
                        className={cn("rounded-2xl border px-4 py-3 text-left text-sm transition-all", when === w ? "border-ink bg-paper font-medium shadow-xs" : "border-line hover:bg-paper/50")}
                      >
                        {w === "now" ? "Right away" : "At a set time"}
                        <span className="block text-xs font-normal text-muted">{w === "now" ? "The link opens today" : "e.g. midnight on birthday"}</span>
                      </button>
                    ))}
                  </div>
                  {when === "later" && (
                    <div className="mt-3">
                      <input
                        type="datetime-local"
                        value={unlockAt}
                        min={localNow()}
                        onChange={(e) => setUnlockAt(e.target.value)}
                        aria-label="Date and time it opens"
                        className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-[15px] outline-none focus:border-ink/40"
                      />
                      {scheduled && (
                        <p className="mt-2 text-sm text-muted">
                          {draft.story.recipient} can open it on{" "}
                          <b className="text-ink">{scheduled.toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</b>
                        </p>
                      )}
                    </div>
                  )}
                </section>

                <section className="rounded-2xl bg-paper p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-medium">{draft.name}</p>
                    <p className="shrink-0 text-right">
                      <span className="type-display text-2xl font-semibold text-muted line-through decoration-1">{formatInr(pricePaise)}</span>{" "}
                      <span className="type-display text-2xl font-semibold">Free</span>
                    </p>
                  </div>
                  <p className="type-label mt-1 text-[10px] text-muted">
                    {templateName} · {facts.pages} pages · {facts.games} games
                  </p>
                  <ul className="mt-3 space-y-1 text-sm">
                    {[
                      "A private link and QR code",
                      `Works for ${giftPricing.linkValidDays} days, until ${formatDay(expiryFor(opens))}`,
                      "Works on every phone, no app",
                    ].map((t) => (
                      <li key={t} className="flex items-center gap-2">
                        <Check className="size-3.5 shrink-0 text-rose-deep" /> {t}
                      </li>
                    ))}
                  </ul>
                </section>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line px-4 py-3 text-sm">
                  <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 size-4 accent-rose-deep" />
                  <span>
                    <b>I’ve checked names, photos and spelling.</b>
                    <span className="block text-muted">Once it’s live, the gift can’t be edited. Use Preview to see it one last time.</span>
                  </span>
                </label>

                {error && <p className="rounded-2xl bg-rose/10 px-4 py-3 text-sm text-rose-deep">{error}</p>}

                {user === null ? (
                  <button
                    type="button"
                    onClick={signIn}
                    disabled={!confirmed || laterMissing}
                    className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-line bg-paper font-medium shadow-sm transition-all hover:bg-white active:scale-98 disabled:opacity-40"
                  >
                    <GoogleMark /> Continue with Google
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={publish}
                    disabled={!confirmed || laterMissing || !!busy || user === undefined}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink font-medium text-paper shadow-sm transition-all hover:bg-ink-soft active:scale-98 disabled:opacity-40"
                  >
                    {busy ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        {busy.total > 0 && busy.done < busy.total ? `Uploading photos ${busy.done}/${busy.total}` : "Making your link"}
                      </>
                    ) : (
                      <>
                        <Lock className="size-4" /> Make it live
                      </>
                    )}
                  </button>
                )}
                <p className="text-center text-xs text-muted">
                  {user ? (
                    <>Signed in as {user.email}. Your gifts are saved to your account.</>
                  ) : (
                    <>Sign in so you can find your gifts again later. Free while we’re getting started.</>
                  )}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** The finished link: copy, WhatsApp, share sheet and a QR code. */
export function ShareLink({ slug, unlockAt, expiresAt, recipient }: { slug: string; unlockAt?: string; expiresAt?: string; recipient: string }) {
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const url = typeof window === "undefined" ? "" : `${window.location.origin}${giftPath(slug)}`;
  const message = `I made something for you, ${recipient} 🎁 ${url}`;

  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, { margin: 1, width: 360, color: { dark: "#1b1215", light: "#fbf8f3" } })
      .then(setQr)
      .catch(() => setQr(null));
    const id = setTimeout(() => setCanShare(typeof navigator.share === "function"), 0);
    return () => clearTimeout(id);
  }, [url]);

  return (
    <div className="space-y-5 px-6 pb-6 pt-4">
      <div className="flex items-center gap-4">
        <div className="grid size-32 shrink-0 place-items-center overflow-hidden rounded-2xl bg-paper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {qr ? <img src={qr} alt="QR code for the gift link" className="size-full" /> : <span className="text-xs text-muted">Making QR…</span>}
        </div>
        <div className="min-w-0 flex-1 space-y-2 text-sm">
          <p className="break-all font-mono text-xs">{url}</p>
          {unlockAt && (
            <p className="flex items-center gap-1.5 text-xs">
              <Clock className="size-3 text-rose" /> Opens {new Date(unlockAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          )}
          {expiresAt && <p className="text-xs text-muted">Link works until {formatDay(expiresAt)}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
          className="flex h-11 items-center justify-center gap-1.5 rounded-full border border-line hover:bg-paper"
        >
          <Copy className="size-4" /> {copied ? "Copied" : "Copy link"}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noreferrer"
          className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-[#25D366] font-medium text-white hover:brightness-95"
        >
          WhatsApp
        </a>
        {canShare && (
          <button
            type="button"
            onClick={() => navigator.share({ title: "A gift for you", text: message.replace(` ${url}`, ""), url }).catch(() => {})}
            className="flex h-11 items-center justify-center gap-1.5 rounded-full border border-line hover:bg-paper"
          >
            <Share2 className="size-4" /> Share
          </button>
        )}
        <a href={url} target="_blank" rel="noreferrer" className={cn("flex h-11 items-center justify-center gap-1.5 rounded-full bg-ink text-paper hover:bg-ink-soft", !canShare && "col-span-2")}>
          <ExternalLink className="size-4" /> Open gift
        </a>
      </div>

      <p className="text-xs text-muted">
        It can’t be changed now. Find it again any time in{" "}
        <Link href="/profile" className="underline underline-offset-2">
          your profile
        </Link>
        .
      </p>
    </div>
  );
}

/** "2026-10-25T23:30" in the sender's own time zone, for the date picker's minimum. */
function localNow() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}
