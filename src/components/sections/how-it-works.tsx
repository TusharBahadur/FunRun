"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { CalendarHeart, Check, Heart, ImageIcon, Link2, Mic, Music, Send } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SplitText } from "@/components/motion/split-text";
import { Typewriter } from "@/components/motion/typewriter";
import { TemplatePreview } from "@/components/templates/template-preview";
import { Eyebrow } from "@/components/ui/eyebrow";
import { EASE_OUT } from "@/lib/motion";
import type { Template } from "@/lib/templates";
import { cn } from "@/lib/utils";

export function HowItWorks({ previews }: { previews: Template[] }) {
  const [active, setActive] = useState(0);

  const steps: { n: string; title: string; body: string; visual: ReactNode }[] = [
    {
      n: "01",
      title: "Pick a template",
      body: "Browse designs crafted for every kind of love — from first dates to fiftieth anniversaries.",
      visual: <PickVisual previews={previews} />,
    },
    {
      n: "02",
      title: "Make it yours",
      body: "Write your note, add photos, a voice memo or the song that’s undeniably yours.",
      visual: <WriteVisual />,
    },
    {
      n: "03",
      title: "Send the feeling",
      body: "Share a private link instantly, or schedule it to open at exactly the right moment.",
      visual: <SendVisual />,
    },
  ];

  return (
    <section id="how" className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-28 md:pb-44">
      <div className="grid gap-14 md:grid-cols-12">
        <div className="md:sticky md:top-32 md:col-span-5 md:self-start">
          <Eyebrow index="02">How it works</Eyebrow>
          <h2 className="mt-5 text-[clamp(2.4rem,5vw,4.5rem)] type-display">
            <SplitText text="Three small steps to" />{" "}
            <SplitText
              text="someone’s whole heart."
              className="type-accent text-rose"
              delay={0.2}
            />
          </h2>
          <p className="type-copy mt-6 max-w-sm text-muted">
            No design skills, no apps to install. If you can write a text message, you can make
            something unforgettable.
          </p>

          <div className="mt-14 hidden items-end gap-5 md:flex">
            <div className="relative h-[6rem] w-[8.5rem] overflow-hidden text-[6rem] font-bold leading-none tracking-[-0.06em]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={active}
                  className="absolute inset-0"
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.6, ease: EASE_OUT }}
                >
                  {steps[active].n}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="mb-4 flex flex-col gap-2">
              {steps.map((s, i) => (
                <span
                  key={s.n}
                  className={cn(
                    "h-1 rounded-full transition-all duration-500 ease-out-expo",
                    i === active ? "w-10 bg-rose" : "w-4 bg-ink/15",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:col-span-6 md:col-start-7">
          {steps.map((step, i) => (
            <StepCard key={step.n} step={step} index={i} setActive={setActive} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  index,
  setActive,
}: {
  step: { n: string; title: string; body: string; visual: ReactNode };
  index: number;
  setActive: (i: number) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const centered = useInView(ref, { margin: "-45% 0px -45% 0px" });

  useEffect(() => {
    if (centered) setActive(index);
  }, [centered, index, setActive]);

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1, ease: EASE_OUT }}
      className="rounded-[2rem] border border-line bg-paper p-3"
    >
      <div className="relative h-72 overflow-hidden rounded-[1.5rem] bg-cream">{step.visual}</div>
      <div className="flex gap-5 p-5 pt-6">
        <span className="mt-2 font-mono text-xs text-rose">{step.n}</span>
        <div>
          <h3 className="type-heading text-2xl">{step.title}</h3>
          <p className="type-copy mt-3 text-muted">{step.body}</p>
        </div>
      </div>
    </motion.article>
  );
}

function PickVisual({ previews }: { previews: Template[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.6 });

  return (
    <div ref={ref} className="absolute inset-0 flex items-center justify-center">
      {previews.slice(0, 3).map((t, i) => {
        const offset = i - 1;
        const chosen = i === 1;
        return (
          <motion.div
            key={t.slug}
            className="absolute w-28 sm:w-36"
            style={{ zIndex: chosen ? 2 : 1 }}
            animate={
              inView
                ? { x: offset * 105, rotate: offset * 10, y: chosen ? -14 : 12, scale: chosen ? 1.06 : 0.92 }
                : { x: offset * 24, rotate: offset * 4, y: 0, scale: 0.9 }
            }
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
          >
            <TemplatePreview template={t} className="rounded-2xl shadow-xl" />
            {chosen && (
              <motion.span
                className="absolute -right-2 -top-2 grid size-8 place-items-center rounded-full bg-rose text-paper shadow-lg"
                animate={{ scale: inView ? 1 : 0 }}
                transition={{ delay: inView ? 0.45 : 0, type: "spring", stiffness: 300, damping: 15 }}
              >
                <Check className="size-4" strokeWidth={3} />
              </motion.span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function WriteVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-5">
      <div className="w-full max-w-sm rounded-2xl bg-paper p-5 shadow-[0_20px_40px_-20px_rgba(27,18,21,0.3)]">
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-ink/10" />
            <span className="size-2.5 rounded-full bg-ink/10" />
            <span className="size-2.5 rounded-full bg-ink/10" />
          </div>
          <span className="rounded-full bg-blush px-2.5 py-1 text-xs font-medium text-wine">To: Maya</span>
        </div>
        <p className="mt-5 min-h-[5.5rem] font-serif text-[1.6rem] leading-[1.15]">
          <Typewriter text="Dear Maya, you make ordinary Tuesdays feel like holidays." />
        </p>
        <div className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-muted">
          {[ImageIcon, Music, Mic].map((Icon, i) => (
            <span key={i} className="grid size-9 place-items-center rounded-full bg-cream">
              <Icon className="size-4" />
            </span>
          ))}
          <span className="ml-auto text-xs">Autosaved</span>
        </div>
      </div>
    </div>
  );
}

function SendVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setSent((s) => !s), 2200);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <div ref={ref} className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-5">
      <motion.div
        className="text-rose"
        animate={
          inView
            ? { x: [-120, 0, 140], y: [30, 0, -40], opacity: [0, 1, 0], rotate: [12, 0, -12] }
            : { opacity: 0 }
        }
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Send className="size-8" />
      </motion.div>

      <div className="flex w-full max-w-sm items-center gap-2 rounded-full bg-paper p-1.5 pl-4 shadow-[0_14px_30px_-16px_rgba(27,18,21,0.35)]">
        <Link2 className="size-4 shrink-0 text-muted" />
        <span className="truncate text-sm">tynitales.gift/for/maya</span>
        <span className="relative ml-auto h-9 w-[6.75rem] shrink-0 overflow-hidden rounded-full text-sm font-medium text-paper">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={sent ? "sent" : "copy"}
              className={cn(
                "absolute inset-0 flex items-center justify-center gap-1.5",
                sent ? "bg-rose" : "bg-ink",
              )}
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
            >
              {sent ? (
                <>
                  Sent <Heart className="size-3.5 fill-current" />
                </>
              ) : (
                "Copy link"
              )}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>

      <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper/70 px-3 py-1.5 text-xs text-muted">
        <CalendarHeart className="size-3.5 text-rose" /> Opens Feb 14 · 9:00 AM
      </span>
    </div>
  );
}
