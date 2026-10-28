import Image from "next/image";
import { Marquee } from "@/components/motion/marquee";
import { SplitText } from "@/components/motion/split-text";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { LoveNote } from "@/data/love-notes";
import { cn } from "@/lib/utils";

export function LoveNotes({ notes }: { notes: LoveNote[] }) {
  const half = Math.ceil(notes.length / 2);

  return (
    <section id="love-notes" className="scroll-mt-24 overflow-hidden py-14 md:py-20">
      <div className="mx-auto mb-8 flex max-w-7xl flex-col items-center px-5 text-center md:mb-12">
        <Eyebrow>Real DMs & Reactions</Eyebrow>
        <h2 className="mt-5 text-[clamp(2.4rem,5vw,4.5rem)] type-display">
          <SplitText text="Straight from" />{" "}
          <SplitText
            text="the DMs."
            className="type-accent text-rose"
            delay={0.1}
          />
        </h2>
        <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
          No scripted reviews or corporate ratings. Just unfiltered messages and real
          reactions from people who made their person feel truly loved.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:gap-6">
        {/* Row 1 - Marquee left */}
        <Marquee duration={50} fade={false}>
          {notes.slice(0, half).map((note) => (
            <DmCard key={note.id} note={note} />
          ))}
        </Marquee>

        {/* Row 2 - Marquee reverse */}
        <Marquee duration={55} reverse fade={false}>
          {notes.slice(half).map((note) => (
            <DmCard key={note.id} note={note} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}

/** A DM, as it is: their avatar and their bubbles, straight on the page. */
function DmCard({ note }: { note: LoveNote }) {
  return (
    <figure className="my-3 flex w-[280px] shrink-0 items-end gap-2.5 select-none sm:w-[340px]">
      <Image
        src={note.avatar}
        alt=""
        width={32}
        height={32}
        className="mb-1 size-8 shrink-0 rounded-full object-cover ring-2 ring-white"
      />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5 pb-2">
        {note.messages.map((msg, idx) => {
          const isLast = idx === note.messages.length - 1;
          const isFirst = idx === 0;
          return (
            <div
              key={idx}
              className={cn(
                "relative max-w-full rounded-[1.15rem] bg-white px-3.5 py-2.5 text-left text-[13px] leading-[1.45] text-ink shadow-[0_6px_16px_-10px_rgba(27,18,21,0.28)] ring-1 ring-ink/[0.05] sm:text-sm",
                // Instagram-style grouping: the corner nearest the avatar tucks in.
                isFirst && !isLast && "rounded-bl-[6px]",
                !isFirst && !isLast && "rounded-l-[6px]",
                !isFirst && isLast && "rounded-tl-[6px] rounded-bl-[4px]",
                isFirst && isLast && "rounded-bl-[4px]",
              )}
            >
              <p className="whitespace-pre-line break-words">{msg}</p>
              {isLast && (
                <span
                  aria-label="Heart reaction"
                  className="absolute -bottom-2.5 left-3 rounded-full bg-white px-1.5 py-0.5 text-[11px] leading-none shadow-sm ring-1 ring-ink/[0.06]"
                >
                  {note.reaction || "❤️"}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </figure>
  );
}
