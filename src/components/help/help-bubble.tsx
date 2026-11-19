"use client";

/* eslint-disable @next/next/no-img-element -- one tiny local sticker */
import { ArrowRight, Eye, MessageCircle, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { occasions, siteConfig } from "@/config/site";
import { faqGroups } from "@/data/faq";
import { cn } from "@/lib/utils";

/**
 * The little helper in the corner. Tap-to-answer, no AI and nothing sent
 * anywhere: it helps people pick a gift, answers the common questions from
 * our FAQ, and hands over to WhatsApp for anything else. In the editor it
 * offers the guided "make it in a minute" flow.
 */

export type HelpTemplate = { slug: string; name: string; occasion: string; description: string };

type Entry = { from: "bot" | "me"; body: ReactNode };

const AVATAR = "/a/s/m-flower-cat.96a40b3568.thumb.webp";
const SEEN_KEY = "tynitales:help-tip-seen";
const whatsappHref = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent("Hi TyniTales! I have a question:")}`;

const faq = (q: string) => faqGroups.flatMap((g) => g.items).find((f) => f.q === q)?.a ?? "";
const questions = [
  { chip: "How does it work?", answer: () => "Pick a template, add their name, your photos, a song and your words, then make it live for ₹99 and send the private link. Most people finish in about five minutes." },
  { chip: "How much is it?", answer: () => faq("How much does a digital gift cost?") },
  { chip: "How do I send it?", answer: () => faq("How do I send the gift?") },
  { chip: "Can it open at midnight?", answer: () => faq("Can I schedule it to open at midnight?") },
];

const noop = () => () => {};

/** Rendered straight into <body>: page wrappers with transforms would otherwise stop it staying fixed. */
export function HelpBubble(props: Parameters<typeof Bubble>[0]) {
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  return mounted ? createPortal(<Bubble {...props} />, document.body) : null;
}

function Bubble({
  templates,
  onQuick,
}: {
  /** On the website: the catalogue, to suggest a gift by occasion. */
  templates?: HelpTemplate[];
  /** In the editor: start the guided flow. */
  onQuick?: () => void;
}) {
  const inEditor = !!onQuick;
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState(false);
  const [log, setLog] = useState<Entry[]>([]);
  const [chips, setChips] = useState<"start" | "occasion">("start");
  const end = useRef<HTMLDivElement>(null);

  // A small "Ask anything" tip, once on this device, a moment after the page settles.
  // It steps aside after a few seconds or as soon as they scroll, so it never sits over the page.
  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* show it */
    }
    if (seen) return;
    let hideAt = 0;
    const away = () => {
      setTip(false);
      try {
        localStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* fine */
      }
    };
    const showAt = window.setTimeout(() => {
      setTip(true);
      hideAt = window.setTimeout(away, 6000);
      window.addEventListener("scroll", away, { once: true, passive: true });
    }, 2500);
    return () => {
      window.clearTimeout(showAt);
      window.clearTimeout(hideAt);
      window.removeEventListener("scroll", away);
    };
  }, []);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [log, open]);

  function hideTip() {
    setTip(false);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* fine */
    }
  }

  function openPanel() {
    hideTip();
    setOpen(true);
    if (!log.length) {
      setLog([
        {
          from: "bot",
          body: inEditor
            ? "Hi! Want me to set this up with you? I’ll ask for the names, your photos, a song and your letter. Takes about a minute."
            : "Hi! I can help you find the right gift, or answer a quick question.",
        },
      ]);
    }
  }

  const say = (me: string, bot: ReactNode) => setLog((l) => [...l, { from: "me", body: me }, { from: "bot", body: bot }]);

  function pickOccasion(id: string, label: string) {
    const list = (templates ?? []).filter((t) => t.occasion === id).slice(0, 3);
    say(
      label,
      <div className="space-y-2">
        <p>{list.length ? `Here are a few ${label.toLowerCase()} gifts:` : "We don’t have one for that yet. Have a look at everything:"}</p>
        {list.map((t) => (
          <div key={t.slug} className="rounded-xl border border-line bg-cream p-3">
            <p className="font-medium">{t.name}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted">{t.description}</p>
            <div className="mt-2 flex gap-2">
              <Link href={`/preview/${t.slug}`} className="btn btn-paper flex h-8 items-center gap-1 px-3 text-xs">
                <Eye className="size-3.5" /> Preview
              </Link>
              <Link href={`/studio/${t.slug}?quick=1`} className="btn btn-rose flex h-8 items-center gap-1 px-3 text-xs">
                <Sparkles className="size-3.5" /> Fill it in for me
              </Link>
            </div>
          </div>
        ))}
        <Link href={list.length ? `/templates/for/${id}` : "/templates"} className="inline-flex items-center gap-1 text-sm font-medium text-rose-deep">
          See all <ArrowRight className="size-3.5" />
        </Link>
      </div>,
    );
    setChips("start");
  }

  const chip = "shrink-0 rounded-full border border-line bg-paper px-3.5 py-2 text-sm hover:border-ink/30";

  return (
    <div
      className={cn(
        "help-bubble fixed right-4 z-[60] flex flex-col items-end bottom-[calc(env(safe-area-inset-bottom,0px)+16px)]",
        // Above anything else pinned to the bottom: the "continue your gift" chip, a template page's buy bar.
        "[body:has([data-continue-chip])_&]:bottom-[calc(env(safe-area-inset-bottom,0px)+76px)]",
        "max-md:[body:has([data-bottom-bar])_&]:bottom-[calc(env(safe-area-inset-bottom,0px)+92px)]",
      )}
    >
      {open && (
        <section
          role="dialog"
          aria-label="Help"
          className="mb-3 flex max-h-[min(70vh,560px)] w-[min(calc(100vw-2rem),360px)] flex-col overflow-hidden rounded-3xl border border-line bg-paper shadow-[0_24px_60px_-20px_rgba(27,18,21,0.45)]"
        >
          <header className="flex items-center gap-2.5 border-b border-line px-4 py-3">
            <img src={AVATAR} alt="" className="size-8 rounded-full object-cover" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Tyni</p>
              <p className="text-xs text-muted">Usually here to help</p>
            </div>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-full text-muted hover:bg-cream hover:text-ink">
              <X className="size-4" />
            </button>
          </header>

          <div data-lenis-prevent className="flex-1 space-y-2.5 overflow-y-auto px-4 py-4 text-sm leading-snug">
            {log.map((e, i) => (
              <div key={i} className={cn("max-w-[88%] rounded-2xl px-3.5 py-2.5", e.from === "bot" ? "rounded-bl-md bg-cream" : "ml-auto rounded-br-md bg-ink text-paper")}>
                {e.body}
              </div>
            ))}
            <div ref={end} />
          </div>

          <div className="border-t border-line px-3 py-3">
            {inEditor && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onQuick();
                }}
                className="btn btn-rose mb-2.5 flex h-11 w-full items-center justify-center gap-2 text-sm"
              >
                <Sparkles className="size-4" /> Yes, let’s do it
              </button>
            )}
            <div data-lenis-prevent className="no-scrollbar flex gap-2 overflow-x-auto">
              {chips === "occasion"
                ? occasions.map((o) => (
                    <button key={o.id} type="button" className={chip} onClick={() => pickOccasion(o.id, o.label)}>
                      {o.label}
                    </button>
                  ))
                : (
                  <>
                    {!inEditor && (
                      <button
                        type="button"
                        className={chip}
                        onClick={() => {
                          say("Help me pick a gift", "Sure! What’s the occasion?");
                          setChips("occasion");
                        }}
                      >
                        Help me pick a gift
                      </button>
                    )}
                    {questions.map((q) => (
                      <button key={q.chip} type="button" className={chip} onClick={() => say(q.chip, q.answer())}>
                        {q.chip}
                      </button>
                    ))}
                    <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={cn(chip, "flex items-center gap-1.5")}>
                      <MessageCircle className="size-3.5" /> Talk to a human
                    </a>
                  </>
                )}
            </div>
          </div>
        </section>
      )}

      {!open && tip && (
        <div className="relative mb-2.5 mr-1 flex items-center gap-1 rounded-full border border-line bg-paper py-2 pl-4 pr-2 text-sm font-medium shadow-[0_10px_30px_-12px_rgba(27,18,21,0.35)]">
          <button type="button" onClick={openPanel}>
            {inEditor ? "Want me to fill it in?" : "Ask anything"}
          </button>
          <button type="button" aria-label="Hide" onClick={hideTip} className="grid size-6 place-items-center rounded-full text-muted hover:bg-cream">
            <X className="size-3.5" />
          </button>
          <span aria-hidden className="absolute -bottom-1.5 right-6 size-3 rotate-45 border-b border-r border-line bg-paper" />
        </div>
      )}

      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-label={open ? "Close help" : "Help"}
        className="grid size-14 place-items-center rounded-full bg-[conic-gradient(from_200deg,var(--color-rose),#a78bfa,var(--color-rose))] p-[3px] shadow-[0_10px_28px_-8px_rgba(226,59,84,0.55)]"
      >
        {open ? (
          <span className="grid size-full place-items-center rounded-full bg-paper">
            <X className="size-5" />
          </span>
        ) : (
          <img src={AVATAR} alt="" className="size-full rounded-full border-2 border-white bg-white object-cover" />
        )}
      </button>
    </div>
  );
}
