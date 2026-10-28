import Image from "next/image";
import { Marquee } from "@/components/motion/marquee";
import type { LoveNote } from "@/data/love-notes";
import { cn } from "@/lib/utils";

export function LoveNotes({ notes }: { notes: LoveNote[] }) {
  const half = Math.ceil(notes.length / 2);

  return (
    <section id="love-notes" className="scroll-mt-24 overflow-hidden py-8 md:py-14">
      <div className="flex flex-col gap-3 sm:gap-6">
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
  const isLong = note.messages.some((m) => m.length > 180);

  return (
    <figure
      style={{
        transform: `rotate(${note.tilt}deg)`,
      }}
      className={cn(
        "group/card my-3.5 flex shrink-0 flex-col justify-between rounded-[26px] bg-white p-2 sm:p-2.5",
        isShort
          ? "w-[220px] sm:w-[250px]"
          : isLong
          ? "w-[330px] sm:w-[410px]"
          : "w-[290px] sm:w-[350px]",
        "border border-black/[0.08] shadow-[0_12px_30px_-6px_rgba(0,0,0,0.16)]",
        "transition-all duration-400 ease-out-expo hover:!rotate-0 hover:scale-[1.03] hover:shadow-[0_20px_45px_-6px_rgba(0,0,0,0.26)] hover:z-20 select-none",
      )}
    >
      <div className="relative flex flex-col justify-center rounded-[20px] bg-black p-3.5 sm:p-4 text-left text-white shadow-inner">
        {/* Message bubble stream with sender avatar at bottom-left */}
        <div className="flex flex-col gap-1">
          <div className="flex items-end gap-2.5">
            {/* Sender circular avatar - authentic Indian face */}
            <Image
              src={note.avatar}
              alt="Customer avatar"
              width={32}
              height={32}
              className="size-7 sm:size-8 shrink-0 rounded-full object-cover ring-1 ring-white/20 select-none mb-0.5"
            />

            {/* Chat bubble(s) */}
            <div className="flex flex-1 flex-col items-start gap-1.5 min-w-0">
              {note.messages.map((msg, idx) => {
                const isLast = idx === note.messages.length - 1;
                const isFirst = idx === 0;

                return (
                  <div
                    key={idx}
                    className={cn(
                      "relative max-w-[96%] bg-[#262626] px-3.5 py-2.5 text-[12.5px] leading-[1.42] text-[#f2f2f2] sm:text-[13px]",
                      isFirst && !isLast && "rounded-2xl rounded-bl-[6px]",
                      !isFirst && isLast && "rounded-2xl rounded-tl-[6px] rounded-bl-[4px]",
                      isFirst && isLast && "rounded-2xl rounded-bl-[4px]",
                      !isFirst && !isLast && "rounded-2xl rounded-l-[6px]",
                    )}
                  >
                    <p className="whitespace-pre-line break-words font-sans selection:bg-rose selection:text-white">
                      {msg}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Red heart reaction sitting below the bubble, matching real Instagram DM screenshot */}
          <div className="pl-9 sm:pl-10 pt-0.5">
            <span className="text-[13px] sm:text-[14px] leading-none select-none">
              {note.reaction || "❤️"}
            </span>
          </div>
        </div>
      </div>
    </figure>
  );
}
