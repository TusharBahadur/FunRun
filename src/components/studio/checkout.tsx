"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, ExternalLink, Lock, X } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { storyFacts } from "@/components/story/labels";
import { cn, formatInr } from "@/lib/utils";
import type { Draft } from "./draft-store";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);

/**
 * "Make it live": the pay-later checkout. People build the whole gift for
 * free; paying is the last step. Payments aren't connected yet, so this
 * finishes with a test link that works on this device.
 */
export function Checkout({
  open,
  onClose,
  draft,
  templateName,
  pricePaise,
  onPublished,
}: {
  open: boolean;
  onClose: () => void;
  draft: Draft;
  templateName: string;
  pricePaise: number;
  onPublished: (live: NonNullable<Draft["live"]>) => void;
}) {
  const [link, setLink] = useState(() => slugify(draft.story.recipient) || "someone-special");
  const [when, setWhen] = useState<"now" | "later">("now");
  const [unlockAt, setUnlockAt] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const facts = storyFacts(draft.story.scenes.filter((s) => !s.hidden));
  const testUrl = typeof window === "undefined" ? "" : `${window.location.origin}/g/${draft.id}`;
  const done = !!draft.live;

  useEffect(() => {
    if (!done || !testUrl) return;
    QRCode.toDataURL(testUrl, { margin: 1, width: 360, color: { dark: "#1b1215", light: "#fbf8f3" } }).then(setQr).catch(() => setQr(null));
  }, [done, testUrl]);

  function publish() {
    onPublished({
      link: link || "someone-special",
      unlockAt: when === "later" && unlockAt ? new Date(unlockAt).toISOString() : undefined,
      publishedAt: new Date().toISOString(),
      paid: false,
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] grid place-items-center bg-ink/30 p-4 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Make it live"
            data-lenis-prevent
            className="max-h-[92vh] w-[min(96vw,520px)] overflow-y-auto rounded-[1.6rem] bg-cream shadow-float"
            initial={{ y: 20, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 20, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-6 pt-5">
              <div>
                <p className="type-label text-[10px] text-muted">Make it first, pay later</p>
                <h2 className="type-display mt-1 text-3xl">
                  {done ? (
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
              <button type="button" onClick={onClose} aria-label="Close" className="grid size-8 place-items-center rounded-lg hover:bg-paper">
                <X className="size-4" />
              </button>
            </div>

            {!done ? (
              <div className="space-y-6 px-6 pb-6 pt-5">
                <section>
                  <p className="mb-2 text-sm font-semibold">Your link</p>
                  <label className="flex items-center rounded-2xl border border-line bg-paper px-4 py-3 text-[15px] focus-within:border-ink/40">
                    <span className="text-muted">tynitales.gift/for/</span>
                    <input value={link} onChange={(e) => setLink(slugify(e.target.value))} className="min-w-0 flex-1 bg-transparent outline-none" aria-label="Link name" />
                  </label>
                </section>

                <section>
                  <p className="mb-2 text-sm font-semibold">When can they open it?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["now", "later"] as const).map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setWhen(w)}
                        className={cn("rounded-2xl border px-4 py-3 text-left text-sm", when === w ? "border-ink bg-paper font-medium" : "border-line")}
                      >
                        {w === "now" ? "Right away" : "At a set time"}
                        <span className="block text-xs font-normal text-muted">{w === "now" ? "The link opens today" : "e.g. midnight on the day"}</span>
                      </button>
                    ))}
                  </div>
                  {when === "later" && (
                    <input
                      type="datetime-local"
                      value={unlockAt}
                      onChange={(e) => setUnlockAt(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-[15px] outline-none"
                      aria-label="Unlock time"
                    />
                  )}
                </section>

                <section className="rounded-2xl bg-paper p-4">
                  <div className="flex items-baseline justify-between">
                    <p className="font-medium">{draft.name}</p>
                    <p className="type-display text-2xl font-semibold">{formatInr(pricePaise)}</p>
                  </div>
                  <p className="type-label mt-1 text-[10px] text-muted">
                    {templateName} · {facts.pages} pages · {facts.games} games
                  </p>
                  <ul className="mt-3 space-y-1 text-sm">
                    {["A private link and QR code", "Edit any time after it’s live", "Works on every phone, no app"].map((t) => (
                      <li key={t} className="flex items-center gap-2">
                        <Check className="size-3.5 text-rose-deep" /> {t}
                      </li>
                    ))}
                  </ul>
                </section>

                <button type="button" onClick={publish} className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink font-medium text-paper hover:bg-ink-soft">
                  <Lock className="size-4" /> Pay {formatInr(pricePaise)} & make it live
                </button>
                <p className="text-center text-xs text-muted">You only pay now, after you’ve made it exactly how you want.</p>
              </div>
            ) : (
              <div className="space-y-5 px-6 pb-6 pt-4">
                <p className="rounded-2xl border border-dashed border-rose-deep/40 bg-paper px-4 py-3 text-sm">
                  <b>Payments aren’t connected yet, so nothing was charged.</b> Here’s a test link that opens the gift on this device. Once payments are live, this
                  becomes <b>tynitales.gift/for/{draft.live!.link}</b> and works for anyone.
                </p>
                <div className="flex items-center gap-4">
                  <div className="grid size-36 shrink-0 place-items-center overflow-hidden rounded-2xl bg-paper">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {qr ? <img src={qr} alt="QR code for the test link" className="size-full" /> : <span className="text-xs text-muted">Making QR…</span>}
                  </div>
                  <div className="min-w-0 space-y-2 text-sm">
                    <p className="break-all font-mono text-xs">{testUrl}</p>
                    {draft.live?.unlockAt && <p className="text-xs text-muted">Opens {new Date(draft.live.unlockAt).toLocaleString("en-IN")}</p>}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(testUrl);
                            setCopied(true);
                          } catch {
                            setCopied(false);
                          }
                        }}
                        className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5"
                      >
                        <Copy className="size-3.5" /> {copied ? "Copied" : "Copy link"}
                      </button>
                      <a href={testUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-paper">
                        <ExternalLink className="size-3.5" /> Open gift
                      </a>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted">Keep editing any time; the link always shows your latest version.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
