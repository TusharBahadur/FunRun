import Image from "next/image";
import { Marquee } from "@/components/motion/marquee";
import { SplitText } from "@/components/motion/split-text";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { LoveNote } from "@/data/love-notes";
import { cn } from "@/lib/utils";

export function LoveNotes({ notes }: { notes: LoveNote[] }) {
  const half = Math.ceil(notes.length / 2);

  return (
    <section id="love-notes" className="scroll-mt-24 overflow-hidden py-16 md:py-24">
      <div className="mx-auto mb-12 flex max-w-7xl flex-col items-center px-5 text-center md:mb-16">
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

      <div className="flex flex-col gap-6">
        {/* Row 1 - Marquee left */}
        <Marquee duration={50}>
          {notes.slice(0, half).map((note) => (
            <DmCard key={note.id} note={note} />
          ))}
        </Marquee>

        {/* Row 2 - Marquee reverse */}
        <Marquee duration={55} reverse>
          {notes.slice(half).map((note) => (
            <DmCard key={note.id} note={note} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}

function DmCard({ note }: { note: LoveNote }) {
  const isShort = note.messages.length === 1 && note.messages[0].length < 30;

  return (
    <figure
      style={{
        transform: `rotate(${note.tilt}deg)`,
      }}
      className={cn(
        "group/card my-3.5 flex shrink-0 flex-col justify-between rounded-[24px] bg-white p-2.5",
        isShort ? "w-[240px] sm:w-[260px]" : "w-[300px] sm:w-[360px]",
        "border border-black/[0.08] shadow-[0_12px_28px_-8px_rgba(27,18,21,0.16)]",
        "transition-all duration-400 ease-out-expo hover:!rotate-0 hover:scale-[1.03] hover:shadow-[0_20px_45px_-6px_rgba(27,18,21,0.26)] hover:z-20 select-none",
      )}
    >
      <div className="relative flex min-h-[110px] flex-col justify-center rounded-[18px] bg-[#0c0c0e] p-3.5 sm:p-4 text-left text-white shadow-inner">
        {/* Message bubble stream with sender avatar at bottom-left */}
        <div className="flex items-end gap-2.5">
          {/* Sender circular avatar - Asian / Indian face */}
          <Image
            src={note.avatar}
            alt="Customer avatar"
            width={32}
            height={32}
            className="size-7 sm:size-8 shrink-0 rounded-full object-cover ring-1 ring-white/20 select-none mb-1"
          />

          {/* Chat bubbles */}
          <div className="flex flex-1 flex-col items-start gap-1.5 min-w-0 pb-1">
            {note.messages.map((msg, idx) => {
              const isLast = idx === note.messages.length - 1;
              const isFirst = idx === 0;

              return (
                <div
                  key={idx}
                  className={cn(
                    "relative max-w-[94%] bg-[#262626] px-3.5 py-2.5 text-[12.5px] leading-[1.42] text-[#f2f2f2] sm:text-[13px]",
                    isFirst && !isLast && "rounded-2xl rounded-bl-[6px]",
                    !isFirst && isLast && "rounded-2xl rounded-tl-[6px] rounded-bl-[4px]",
                    isFirst && isLast && "rounded-2xl rounded-bl-[4px]",
                    !isFirst && !isLast && "rounded-2xl rounded-l-[6px]",
                  )}
                >
                  <p className="whitespace-pre-line break-words font-sans selection:bg-rose selection:text-white">
                    {msg}
                  </p>

                  {/* Red heart reaction badge on the last bubble */}
                  {isLast && (
                    <div
                      aria-label="Heart reaction"
                      className="absolute -bottom-2.5 left-3.5 flex items-center justify-center rounded-full bg-[#262626] border border-black/60 px-1.5 py-0.5 shadow-md ring-1 ring-white/10"
                    >
                      <span className="text-[11px] leading-none select-none">
                        {note.reaction || "❤️"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </figure>
  );
}
