"use client";

import { ArrowRight, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteDraft, listDrafts, type DraftSummary } from "@/lib/drafts";
import { useUser } from "@/lib/supabase/browser";

const ago = new Intl.RelativeTimeFormat("en-IN", { numeric: "auto" });
export function editedAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return ago.format(-mins, "minute");
  const hours = Math.round(mins / 60);
  if (hours < 24) return ago.format(-hours, "hour");
  return ago.format(-Math.round(hours / 24), "day");
}

export const draftHref = (d: DraftSummary) => `/studio/${d.templateSlug}?draft=${d.id}`;

/**
 * Gifts in progress: this device's, plus the account's when signed in.
 * `hideWhenEmpty` for the profile page, where an empty list isn't worth a box.
 */
export function DraftsList({ hideWhenEmpty = false }: { hideWhenEmpty?: boolean }) {
  const user = useUser();
  const [drafts, setDrafts] = useState<DraftSummary[] | null>(null);

  useEffect(() => {
    if (user === undefined) return;
    let alive = true;
    listDrafts(!!user).then((list) => alive && setDrafts(list));
    return () => {
      alive = false;
    };
  }, [user]);

  async function remove(d: DraftSummary) {
    if (!window.confirm(`Delete your gift for ${d.recipient}? This can’t be undone.`)) return;
    setDrafts((list) => list?.filter((x) => x.id !== d.id) ?? null);
    await deleteDraft(d.id, !!user);
  }

  if (!drafts) return hideWhenEmpty ? null : <Loader2 className="mx-auto mt-10 size-6 animate-spin text-muted" />;
  if (!drafts.length) {
    if (hideWhenEmpty) return null;
    return (
      <div className="grid place-items-center rounded-[1.75rem] border border-dashed border-line px-6 py-14 text-center">
        <p className="type-display text-3xl">No drafts.</p>
        <p className="mt-2 max-w-sm text-muted">Start a gift and it saves here as you go, until you make it live.</p>
        <Link href="/templates" className="btn btn-ink mt-6 px-6 py-3">
          Browse templates
        </Link>
      </div>
    );
  }

  return (
    <section className="rounded-[2.25rem] border border-line bg-paper p-5 sm:p-8">
      <p className="type-label text-muted">Not sent yet</p>
      <h2 className="type-display mt-2 text-4xl">
        Your <span className="type-accent text-rose">drafts.</span>
      </h2>
      <ul className="mt-6 divide-y divide-line">
        {drafts.map((d) => (
          <li key={d.id} className="flex items-center gap-3 py-4">
            <Link href={draftHref(d)} className="group min-w-0 flex-1">
              <p className="truncate text-lg font-medium group-hover:text-rose-deep">{d.name}</p>
              <p className="text-sm text-muted">
                For {d.recipient} · edited {editedAgo(d.updatedAt)}
              </p>
            </Link>
            <button
              type="button"
              onClick={() => void remove(d)}
              aria-label={`Delete your gift for ${d.recipient}`}
              className="grid size-10 shrink-0 place-items-center rounded-full text-muted hover:bg-cream hover:text-rose-deep"
            >
              <Trash2 className="size-4" />
            </button>
            <Link href={draftHref(d)} className="btn btn-ink flex h-10 shrink-0 items-center gap-1.5 px-4 text-sm">
              Continue <ArrowRight className="size-3.5" />
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted">
        {user ? "Saved to your account and this device." : "Saved on this device only. Sign in to keep them in your account."} Drafts untouched for 60 days are removed.
      </p>
    </section>
  );
}
