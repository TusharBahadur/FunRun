"use client";

import { Check, Clock, Copy, ExternalLink, Infinity as Forever, KeyRound, Loader2, Lock, PenLine, Share2, X } from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { storyFacts } from "@/components/story/labels";
import { giftPricing } from "@/config/site";
import { editableUntil, formatDay, isFuture, giftPath, PASSWORD_MAX, PASSWORD_MIN, slugifyName } from "@/lib/gift-links";
import { signInWithGoogle, useUser } from "@/lib/supabase/browser";
import { Sheet } from "@/components/ui/sheet";
import { cn, formatInr } from "@/lib/utils";
import { markOwnGift } from "@/components/gift/open-beacon";
import { GoogleMark } from "@/components/profile/sign-in-card";
import type { Draft } from "./draft-store";
import { NeedsSignIn, publishGift, updateGift } from "./publish";

/** Remembers the checkout choices across the trip to Google sign-in and back. */
const pendingKey = (draftId: string) => `tynitales:publish:${draftId}`;
type Pending = { link: string; when: "now" | "later"; unlockAt: string; confirmed: boolean; lock?: boolean };

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
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  draft: Draft;
  templateSlug: string;
  templateName: string;
  pricePaise: number;
  onPublished: (live: NonNullable<Draft["live"]>) => void;
  /** After changes to a live gift are saved. */
  onSaved?: (live: NonNullable<Draft["live"]>) => void;
}) {
  const user = useUser();
  const [link, setLink] = useState(() => slugifyName(draft.story.recipient) || "for-you");
  const [when, setWhen] = useState<"now" | "later">("now");
  const [unlockAt, setUnlockAt] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  // Optional password. The password itself never goes into storage, only into the request.
  const [lock, setLock] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<null | { done: number; total: number }>(null);
  const [error, setError] = useState<string | null>(null);
  const facts = storyFacts(draft.story.scenes.filter((s) => !s.hidden));
  const live = draft.live?.slug ? draft.live : null;
  // A live gift opened again to change it, still inside its 7 days.
  const editing = isFuture(live?.editUntil);

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
      setLock(!!p.lock);
    }, 0);
    return () => clearTimeout(id);
  }, [open, draft.id]);

  const scheduled = when === "later" && unlockAt ? new Date(unlockAt) : null;
  const laterMissing = when === "later" && !unlockAt;
  const passwordShort = lock && password.trim().length < PASSWORD_MIN;

  async function signIn() {
    setError(null);
    writePending(draft.id, { link, when, unlockAt, confirmed, lock });
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
        password: lock ? password.trim() : undefined,
        onProgress: (done, total) => setBusy({ done, total }),
      });
      writePending(draft.id, null);
      markOwnGift(result.slug);
      onPublished({
        link: result.slug,
        slug: result.slug,
        unlockAt: scheduled ? result.unlockAt : undefined,
        editUntil: result.editUntil,
        hasPassword: result.hasPassword,
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
    <Sheet open={open} onClose={onClose} locked={!!busy} label={editing ? "Save changes" : "Make it live"}>
          <div>
            <div className="flex items-start justify-between px-6 pt-3 sm:pt-5">
              <div>
                <p className="type-label text-[10px] text-muted">{editing ? "Your gift is live" : live ? "Your gift is live" : "Last step"}</p>
                <h2 className="type-display mt-1 text-3xl">
                  {editing ? (
                    <>
                      Save your <span className="type-accent text-rose">changes.</span>
                    </>
                  ) : live ? (
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

            {editing && live ? (
              <SaveChanges draft={draft} live={live} onSaved={onSaved} />
            ) : live ? (
              <ShareLink slug={live.slug!} unlockAt={live.unlockAt} editUntil={live.editUntil} recipient={draft.story.recipient} />
            ) : (
              <div className="space-y-6 px-6 pb-6 pt-5">
                <section>
                  <p className="mb-2 text-sm font-semibold">Your link</p>
                  <label className="flex items-center rounded-2xl border border-line bg-paper px-4 py-3 text-[15px] focus-within:border-ink/40">
                    <span className="text-muted">tynitales.com/for/</span>
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

                <PasswordChoice lock={lock} setLock={setLock} password={password} setPassword={setPassword} />

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
                  <p className="mt-3 text-sm font-medium">Pay once. No subscription, nothing more to pay, ever.</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {[
                      { icon: Forever, t: "Never expires. They can open it forever" },
                      { icon: PenLine, t: `Change it any time until ${formatDay(editableUntil())}` },
                      { icon: Check, t: "A private link and QR code, works on every phone" },
                    ].map(({ icon: Icon, t }) => (
                      <li key={t} className="flex items-center gap-2">
                        <Icon className="size-3.5 shrink-0 text-rose-deep" /> {t}
                      </li>
                    ))}
                  </ul>
                </section>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line px-4 py-3 text-sm">
                  <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 size-4 accent-rose-deep" />
                  <span>
                    <b>I’ve checked names, photos and spelling.</b>
                    <span className="block text-muted">You can still change it for {giftPricing.editDays} days after it’s live. After that it’s locked in.</span>
                  </span>
                </label>

                {error && <p className="rounded-2xl bg-rose/10 px-4 py-3 text-sm text-rose-deep">{error}</p>}

                {user === null ? (
                  <button
                    type="button"
                    onClick={signIn}
                    disabled={!confirmed || laterMissing || passwordShort}
                    className="btn btn-paper flex h-14 w-full items-center justify-center gap-3"
                  >
                    <GoogleMark /> Continue with Google
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={publish}
                    disabled={!confirmed || laterMissing || passwordShort || !!busy || user === undefined}
                    className="btn btn-ink flex h-14 w-full items-center justify-center gap-2"
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
          </div>
    </Sheet>
  );
}

/** The finished link: copy, WhatsApp, share sheet and a QR code. */
export function ShareLink({ slug, unlockAt, editUntil, hasPassword, recipient }: { slug: string; unlockAt?: string; editUntil?: string; hasPassword?: boolean; recipient: string }) {
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
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <Forever className="size-3 text-rose" /> Never expires
          </p>
          {hasPassword && (
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <KeyRound className="size-3 text-rose" /> Password protected. Send them the password too.
            </p>
          )}
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
          className="btn btn-paper flex h-11 items-center justify-center gap-1.5"
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
            className="btn btn-paper flex h-11 items-center justify-center gap-1.5"
          >
            <Share2 className="size-4" /> Share
          </button>
        )}
        <a href={url} target="_blank" rel="noreferrer" className={cn("btn btn-ink flex h-11 items-center justify-center gap-1.5", !canShare && "col-span-2")}>
          <ExternalLink className="size-4" /> Open gift
        </a>
      </div>

      <p className="text-xs text-muted">
        {isFuture(editUntil) ? (
          <>You can still change it until {formatDay(editUntil!)}. Find it any time in </>
        ) : (
          <>It’s locked in now. Find it again any time in </>
        )}
        <Link href="/profile" className="underline underline-offset-2">
          your profile
        </Link>
        .
      </p>
    </div>
  );
}

/** Optional password: off by default, a field appears when it's switched on. */
function PasswordChoice({
  lock,
  setLock,
  password,
  setPassword,
  hint,
}: {
  lock: boolean;
  setLock: (v: boolean) => void;
  password: string;
  setPassword: (v: string) => void;
  hint?: string;
}) {
  return (
    <section>
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span>
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <KeyRound className="size-3.5 text-rose-deep" /> Add a password
          </span>
          <span className="block text-xs text-muted">{hint ?? "Optional. They’ll need it to open the gift."}</span>
        </span>
        <span className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", lock ? "bg-rose-deep" : "bg-ink/15")}>
          <input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} className="peer absolute inset-0 cursor-pointer opacity-0" aria-label="Add a password" />
          <span className={cn("absolute top-1 size-5 rounded-full bg-white shadow transition-all", lock ? "left-6" : "left-1")} />
        </span>
      </label>
      {lock && (
        <div className="mt-3">
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value.slice(0, PASSWORD_MAX))}
            placeholder="e.g. our first date"
            autoComplete="off"
            aria-label="Password"
            className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-[15px] outline-none focus:border-ink/40"
          />
          <p className="mt-1.5 text-xs text-muted">
            At least {PASSWORD_MIN} characters. Remember to tell them, we can’t show it again.
          </p>
        </div>
      )}
    </section>
  );
}

/** Changing a live gift (allowed for 7 days): same link, new content. */
function SaveChanges({
  draft,
  live,
  onSaved,
}: {
  draft: Draft;
  live: NonNullable<Draft["live"]>;
  onSaved?: (live: NonNullable<Draft["live"]>) => void;
}) {
  const [busy, setBusy] = useState<null | { done: number; total: number }>(null);
  const [error, setError] = useState<string | null>(null);
  // Password: keep whatever it has, unless they change it here.
  const [lock, setLock] = useState(!!live.hasPassword);
  const [password, setPassword] = useState("");
  const notOpenYet = isFuture(live.unlockAt);
  const [unlockAt, setUnlockAt] = useState(() => (notOpenYet && live.unlockAt ? toLocalInput(live.unlockAt) : ""));
  const passwordChanged = lock !== !!live.hasPassword || (lock && password.trim().length > 0);
  const passwordShort = lock && !live.hasPassword && password.trim().length < PASSWORD_MIN;
  const passwordTooShortNew = lock && password.trim().length > 0 && password.trim().length < PASSWORD_MIN;

  async function save() {
    setError(null);
    setBusy({ done: 0, total: 0 });
    try {
      const result = await updateGift({
        slug: live.slug!,
        name: draft.name,
        story: draft.story,
        unlockAt: notOpenYet && unlockAt ? new Date(unlockAt).toISOString() : undefined,
        // undefined keeps the current password; null removes it.
        password: !passwordChanged ? undefined : lock ? password.trim() || undefined : null,
        onProgress: (done, total) => setBusy({ done, total }),
      });
      onSaved?.({ ...live, unlockAt: result.unlockAt, editUntil: result.editUntil, hasPassword: result.hasPassword });
    } catch (e) {
      setError(e instanceof NeedsSignIn ? "Please sign in again to save your changes." : e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6 px-6 pb-6 pt-5">
      <p className="flex items-start gap-2 rounded-2xl bg-paper px-4 py-3 text-sm">
        <PenLine className="mt-0.5 size-4 shrink-0 text-rose-deep" />
        <span>
          Same link, updated gift. You can keep changing it until <b>{formatDay(live.editUntil!)}</b>, then it’s locked in. It never expires.
        </span>
      </p>

      {notOpenYet && (
        <section>
          <p className="mb-2 text-sm font-semibold">When can they open it?</p>
          <input
            type="datetime-local"
            value={unlockAt}
            min={localNow()}
            onChange={(e) => setUnlockAt(e.target.value)}
            aria-label="Date and time it opens"
            className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-[15px] outline-none focus:border-ink/40"
          />
        </section>
      )}

      <PasswordChoice
        lock={lock}
        setLock={setLock}
        password={password}
        setPassword={setPassword}
        hint={live.hasPassword ? "It has a password now. Leave the box empty to keep it, or type a new one." : undefined}
      />

      {error && <p className="rounded-2xl bg-rose/10 px-4 py-3 text-sm text-rose-deep">{error}</p>}

      <button
        type="button"
        onClick={save}
        disabled={!!busy || passwordShort || passwordTooShortNew}
        className="btn btn-ink flex h-14 w-full items-center justify-center gap-2"
      >
        {busy ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {busy.total > 0 && busy.done < busy.total ? `Uploading photos ${busy.done}/${busy.total}` : "Saving"}
          </>
        ) : (
          <>
            <Check className="size-4" /> Save changes
          </>
        )}
      </button>
    </div>
  );
}

/** An ISO time as "2026-10-25T23:30" in the sender's own time zone, for the date picker. */
function toLocalInput(iso: string) {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

/** "2026-10-25T23:30" in the sender's own time zone, for the date picker's minimum. */
function localNow() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}
