import { Heart } from "lucide-react";
import { Marquee } from "@/components/motion/marquee";
import { SplitText } from "@/components/motion/split-text";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { LoveNote } from "@/data/love-notes";
import { cn } from "@/lib/utils";

export function LoveNotes({ notes }: { notes: LoveNote[] }) {
  const half = Math.ceil(notes.length / 2);
  return (
    <section id="love-notes" className="scroll-mt-24 overflow-hidden py-14 md:py-20">
      <div className="mx-auto mb-12 md:mb-16 flex max-w-7xl flex-col items-center px-5 text-center">
        <Eyebrow>Love notes</Eyebrow>
        <h2 className="mt-5 text-[clamp(2.4rem,5vw,4.5rem)] type-display">
          <SplitText text="Words that" />{" "}
          <SplitText
            text="landed."
            className="type-accent text-rose"
            delay={0.1}
          />
        </h2>
      </div>
      <div className="flex flex-col gap-5">
        <Marquee duration={55}>
          {notes.slice(0, half).map((note, i) => (
            <NoteCard key={note.name} note={note} tilt={i % 2 === 0} />
          ))}
        </Marquee>
        <Marquee duration={60} reverse>
          {notes.slice(half).map((note, i) => (
            <NoteCard key={note.name} note={note} tilt={i % 2 === 1} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}

function NoteCard({ note, tilt }: { note: LoveNote; tilt: boolean }) {
  return (
    <figure
      className={cn(
        "my-3 flex w-[300px] shrink-0 flex-col justify-between rounded-[1.5rem] border border-line bg-paper p-6 transition-transform duration-500 ease-out-expo hover:rotate-0 sm:w-[360px]",
        tilt ? "rotate-1" : "-rotate-1",
      )}
    >
      <div className="flex gap-0.5 text-rose">
        {Array.from({ length: 5 }).map((_, i) => (
          <Heart key={i} className="size-3.5 fill-current" />
        ))}
      </div>
      <blockquote className="type-heading mt-4 text-[1.35rem] leading-[1.05]">“{note.quote}”</blockquote>
      <figcaption className="mt-6 flex items-center justify-between text-sm">
        <span className="font-medium">{note.name}</span>
        <span className="text-muted">{note.context}</span>
      </figcaption>
    </figure>
  );
}
