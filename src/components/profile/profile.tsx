"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, ExternalLink, Eye, Gift, Hourglass, KeyRound, Loader2, LogOut, PenLine, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { giftPricing } from "@/config/site";
import { formatDay, giftPath } from "@/lib/gift-links";
import { EASE_OUT } from "@/lib/motion";
import { getSupabase, signOut, useUser } from "@/lib/supabase/browser";
import { deleteAccount, useProfile } from "@/lib/supabase/profile";
import { cn } from "@/lib/utils";
import { SignInCard } from "./sign-in-card";

type GiftRow = {
  slug: string;
  name: string;
  recipient: string;
  template_slug: string;
  palette: { bg?: string; fg?: string; accent?: string } | null;
  status: "live" | "expired";
  unlock_at: string;
  edit_until: string | null;
  has_password: boolean;
  created_at: string;
  open_count: number;
  first_opened_at: string | null;
  last_opened_at: string | null;
};

type Tab = "live" | "scheduled" | "closed";

function giftState(g: GiftRow, now: number): Tab {
  // Gifts never expire now; only a few from before can be wrapped up.
  if (g.status === "expired") return "closed";
  if (new Date(g.unlock_at).getTime() > now) return "scheduled";
  return "live";
}

const ago = new Intl.RelativeTimeFormat("en-IN", { numeric: "auto" });
function timeAgo(iso: string, now: number) {
  const diff = (new Date(iso).getTime() - now) / 1000;
  const steps: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.35, "week"],
    [12, "month"],
  ];
  let value = diff;
  for (const [size, unit] of steps) {
    if (Math.abs(value) < size) return ago.format(Math.round(value), unit);
    value /= size;
  }
  return ago.format(Math.round(value), "year");
}

/** The signed-in sender's home: who they are, what they've sent, and their settings. */
export function ProfilePage() {
  const user = useUser();
  const { profile, update } = useProfile(user);
  const [gifts, setGifts] = useState<GiftRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Read the clock when the gifts arrive, not while the page is pre-built.
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    getSupabase()
      .from("gifts")
      .select("slug, name, recipient, template_slug, palette, status, unlock_at, edit_until, has_password, created_at, open_count, first_opened_at, last_opened_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!alive) return;
        setNow(Date.now());
        if (error) setError("Couldn't load your gifts. Please refresh.");
        else setGifts((data ?? []) as GiftRow[]);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  if (user === undefined) return <Loader2 className="mx-auto mt-24 size-6 animate-spin text-muted" />;
  if (user === null) return <SignInCard next="/profile" />;

  const name = profile?.display_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "You";
  const avatar = profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const memberSince = new Date(profile?.created_at ?? user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const list = gifts ?? [];
  const counts = { live: 0, scheduled: 0, closed: 0 } as Record<Tab, number>;
  for (const g of list) counts[giftState(g, now)]++;
  const editable = list.filter((g) => giftState(g, now) !== "closed" && !!g.edit_until && new Date(g.edit_until).getTime() > now).length;

  return (
    <div className="space-y-8">
      {/* ── Who you are ── */}
      <motion.header
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE_OUT }}
        className="border-b border-line pb-10 md:pb-14"
      >
        <Eyebrow>Your profile</Eyebrow>
        <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex min-w-0 items-center gap-5 sm:gap-8">
            <Avatar src={avatar} name={name} />
            <div className="min-w-0">
              <Name value={name} />
              <p className="type-label mt-4 truncate text-muted">
                {user.email} · since {memberSince}
              </p>
            </div>
          </div>
          <ButtonLink href="/templates" variant="rose" className="self-start md:self-auto">
            Make a new gift
          </ButtonLink>
        </div>
      </motion.header>

      {editable > 0 && (
        <p className="flex items-center gap-2 rounded-2xl border border-rose/25 bg-rose/5 px-5 py-3.5 text-sm">
          <PenLine className="size-4 shrink-0 text-rose-deep" />
          You can still change {editable === 1 ? "one of your gifts" : `${editable} of your gifts`}. Each gift locks in {giftPricing.editDays} days after it goes live, and never expires.
        </p>
      )}

      {/* ── Your gifts ── */}
      <GiftsSection gifts={gifts} counts={counts} now={now} error={error} />

      {/* ── Settings ── */}
      <div className="grid gap-6 md:grid-cols-2">
        <SignOffCard value={profile?.sign_off ?? ""} fallback={name.split(" ")[0]} onSave={(sign_off) => update({ sign_off })} />
        <AccountCard />
      </div>
    </div>
  );
}

function Avatar({ src, name }: { src?: string; name: string }) {
  const [broken, setBroken] = useState(false);
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-blush text-2xl font-semibold text-wine ring-1 ring-line ring-offset-4 ring-offset-cream sm:size-24">
      {src && !broken ? (
        // Google profile photos; no-referrer keeps Google from blocking them.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" referrerPolicy="no-referrer" className="size-full object-cover" onError={() => setBroken(true)} />
      ) : (
        initials
      )}
    </div>
  );
}

/** Their name from Google, last word in the accent face: "Tushar Bahadur." */
function Name({ value }: { value: string }) {
  const words = value.trim().split(/\s+/);
  const first = words.length > 1 ? words.slice(0, -1).join(" ") : words[0];
  const last = words.length > 1 ? words[words.length - 1] : "";
  return (
    <h1 className="type-display truncate text-[clamp(2.6rem,6.5vw,5.5rem)] leading-[0.95]">
      {first} {last && <span className="type-accent text-rose">{last}</span>}
      <span className="text-rose">.</span>
    </h1>
  );
}

const tabs: { id: Tab; label: string }[] = [
  { id: "live", label: "Live" },
  { id: "scheduled", label: "Scheduled" },
  { id: "closed", label: "Wrapped up" },
];

function GiftsSection({ gifts, counts, now, error }: { gifts: GiftRow[] | null; counts: Record<Tab, number>; now: number; error: string | null }) {
  const [picked, setPicked] = useState<Tab | null>(null);
  // Open on the first tab that has something in it.
  const tab = picked ?? tabs.find((t) => counts[t.id] > 0)?.id ?? "live";
  const shown = useMemo(() => (gifts ?? []).filter((g) => giftState(g, now) === tab), [gifts, tab, now]);

  return (
    <section className="rounded-[2.25rem] border border-line bg-paper p-5 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="type-label text-muted">Everything you’ve sent</p>
          <h2 className="type-display mt-2 text-4xl">
            Your <span className="type-accent text-rose">gifts.</span>
          </h2>
        </div>
        <div role="tablist" className="flex gap-1 rounded-full border border-line bg-cream p-1">
          {tabs.filter((t) => t.id !== "closed" || counts.closed > 0).map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => setPicked(t.id)}
              className={cn("relative rounded-full px-4 py-2 text-sm transition-colors", tab === t.id ? "text-paper" : "text-ink/70 hover:text-ink")}
            >
              {tab === t.id && <motion.span layoutId="gift-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <span className="relative">
                {t.label} <span className="tabular-nums opacity-60">{counts[t.id]}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-6 rounded-2xl bg-rose/10 px-4 py-3 text-sm text-rose-deep">{error}</p>}
      {!gifts && !error && (
        <div className="mt-6 space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-[1.5rem] bg-line/50" />
          ))}
        </div>
      )}

      {gifts && gifts.length === 0 && (
        <div className="mt-6 grid place-items-center rounded-[1.75rem] border border-dashed border-line px-6 py-14 text-center">
          <Gift className="size-8 text-rose" />
          <p className="type-display mt-4 text-3xl">Nothing sent yet.</p>
          <p className="mt-2 max-w-sm text-muted">Pick a template, fill it with your photos and words, and your links will live here.</p>
          <Link href="/templates" className="btn btn-ink mt-6 px-6 py-3">
            Browse templates
          </Link>
        </div>
      )}

      {gifts && gifts.length > 0 && (
        <ul className="mt-6 space-y-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((g) => (
              <GiftItem key={g.slug} gift={g} now={now} state={tab} />
            ))}
          </AnimatePresence>
          {shown.length === 0 && <li className="py-10 text-center text-muted">No {tab} gifts.</li>}
        </ul>
      )}
    </section>
  );
}

function GiftItem({ gift, now, state }: { gift: GiftRow; now: number; state: Tab }) {
  const [copied, setCopied] = useState(false);
  const accent = gift.palette?.accent ?? "#e23b54";
  const bg = gift.palette?.bg ?? "#f5efe6";
  const editUntil = gift.edit_until ? new Date(gift.edit_until).getTime() : 0;
  const editable = state !== "closed" && editUntil > now;
  const editStart = new Date(gift.created_at).getTime();
  // How much of the 7 days for changes has passed.
  const used = editable ? Math.min(1, Math.max(0, (now - editStart) / (editUntil - editStart))) : 0;
  const url = typeof window === "undefined" ? giftPath(gift.slug) : `${window.location.origin}${giftPath(gift.slug)}`;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
      className={cn("overflow-hidden rounded-[1.5rem] border border-line bg-cream", state === "closed" && "opacity-70")}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl text-2xl font-semibold" style={{ backgroundColor: bg, color: accent, boxShadow: `inset 0 0 0 1px ${accent}33` }}>
          {gift.recipient.slice(0, 1).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{gift.name}</p>
          <p className="mt-0.5 truncate font-mono text-xs text-muted">tynitales.gift{giftPath(gift.slug)}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            {state === "scheduled" ? (
              <span className="flex items-center gap-1.5">
                <Hourglass className="size-3.5" style={{ color: accent }} />
                Opens {new Date(gift.unlock_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Eye className="size-3.5" style={{ color: accent }} />
                {gift.open_count > 0
                  ? `Opened ${gift.open_count} ${gift.open_count === 1 ? "time" : "times"}${gift.last_opened_at ? `, last ${timeAgo(gift.last_opened_at, now)}` : ""}`
                  : "Not opened yet"}
              </span>
            )}
            <span className={cn("text-muted", editable && "font-medium text-rose-deep")}>
              {state === "closed" ? "Wrapped up" : editable ? `Editable until ${formatDay(gift.edit_until!)}` : "Locked in · never expires"}
            </span>
            {gift.has_password && (
              <span className="flex items-center gap-1 text-muted">
                <KeyRound className="size-3.5" /> Password
              </span>
            )}
          </p>
        </div>

        {state !== "closed" && (
          <div className="flex shrink-0 flex-wrap gap-2 text-sm">
            {editable && (
              <Link href={`/studio/${gift.template_slug}?edit=${gift.slug}`} className="btn btn-paper flex h-10 items-center gap-1.5 px-4">
                <PenLine className="size-4" /> Edit
              </Link>
            )}
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                } catch {
                  setCopied(false);
                }
              }}
              className="btn btn-paper flex h-10 items-center gap-1.5 px-4"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? "Copied" : "Copy"}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`I made something for you, ${gift.recipient} 🎁 ${url}`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 items-center rounded-full bg-[#25D366] px-4 font-medium text-white hover:brightness-95"
            >
              WhatsApp
            </a>
            <a href={giftPath(gift.slug)} target="_blank" rel="noreferrer" aria-label="Open gift" className="btn btn-ink grid size-10 place-items-center">
              <ExternalLink className="size-4" />
            </a>
          </div>
        )}
      </div>
      {/* How much of the 7 days for changes has passed */}
      {editable && (
        <div className="h-1 bg-line/60">
          <div className="h-full rounded-r-full transition-[width] duration-700" style={{ width: `${used * 100}%`, backgroundColor: accent }} />
        </div>
      )}
    </motion.li>
  );
}

function SignOffCard({ value, fallback, onSave }: { value: string; fallback: string; onSave: (v: string) => Promise<boolean> }) {
  const [draft, setDraft] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const current = draft ?? value;

  return (
    <section className="rounded-[2rem] border border-line bg-paper p-6 sm:p-8">
      <p className="type-label text-muted">How you sign your gifts</p>
      <h3 className="type-display mt-2 text-3xl">Your sign-off</h3>
      <p className="mt-2 text-sm text-muted">New gifts start with this in the “From” line. You can still change it on each gift.</p>
      <form
        className="mt-5 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setState("saving");
          const ok = await onSave(current.trim().slice(0, 40));
          setState(ok ? "saved" : "idle");
          if (ok) setDraft(null);
        }}
      >
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-line bg-cream px-4 focus-within:border-ink/40">
          <span className="type-hand text-lg text-muted">From</span>
          <input
            value={current}
            placeholder={fallback}
            onChange={(e) => {
              setDraft(e.target.value);
              setState("idle");
            }}
            className="type-hand min-w-0 flex-1 bg-transparent py-3 text-lg outline-none"
            aria-label="Your sign-off"
          />
        </label>
        <button type="submit" disabled={state === "saving" || draft === null} className="btn btn-ink flex h-[52px] items-center gap-2 px-5 text-sm">
          {state === "saving" ? <Loader2 className="size-4 animate-spin" /> : state === "saved" ? <Check className="size-4" /> : null}
          {state === "saved" ? "Saved" : "Save"}
        </button>
      </form>
    </section>
  );
}

function AccountCard() {
  const [confirming, setConfirming] = useState(false);

  return (
    <section className="flex flex-col rounded-[2rem] border border-line bg-paper p-6 sm:p-8">
      <p className="type-label text-muted">Account</p>
      <h3 className="type-display mt-2 text-3xl">Signed in with Google</h3>
      <p className="mt-2 text-sm text-muted">Drafts you’re still editing stay on this device. Gifts you’ve made live are saved to your account.</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <button type="button" onClick={() => signOut()} className="btn btn-paper flex h-11 items-center gap-2 px-5 text-sm">
          <LogOut className="size-4" /> Sign out
        </button>
        <button type="button" onClick={() => setConfirming(true)} className="flex h-11 items-center gap-2 rounded-full px-5 text-sm text-rose-deep hover:bg-rose/5">
          <Trash2 className="size-4" /> Delete account
        </button>
      </div>
      <DeleteDialog open={confirming} onClose={() => setConfirming(false)} />
    </section>
  );
}

function DeleteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] grid place-items-center bg-ink/30 p-4 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={busy ? undefined : onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Delete account"
            className="w-[min(94vw,440px)] rounded-[1.6rem] bg-cream p-6 shadow-float"
            initial={{ y: 16, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 16, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2 className="type-display text-3xl">Delete your account?</h2>
              <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="grid size-8 place-items-center rounded-lg hover:bg-paper">
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-3 text-sm text-muted">
              This deletes your account, every gift you’ve made and all the photos and songs in them. <b className="text-ink">Links you’ve shared will stop working.</b> It can’t be undone.
            </p>
            <label className="mt-5 block text-sm">
              Type <b>DELETE</b> to confirm
              <input value={typed} onChange={(e) => setTyped(e.target.value)} className="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 outline-none focus:border-ink/40" />
            </label>
            {error && <p className="mt-3 text-sm text-rose-deep">{error}</p>}
            <button
              type="button"
              disabled={typed !== "DELETE" || busy}
              onClick={async () => {
                setBusy(true);
                setError(null);
                try {
                  await deleteAccount();
                  window.location.href = "/";
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Something went wrong.");
                  setBusy(false);
                }
              }}
              className="btn btn-rose mt-5 flex h-12 w-full items-center justify-center gap-2"
            >
              {busy && <Loader2 className="size-4 animate-spin" />} Delete everything
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
