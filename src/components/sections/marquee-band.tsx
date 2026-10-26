import { VelocityMarquee } from "@/components/motion/velocity-marquee";
import { cn } from "@/lib/utils";

const words = [
  "Love letters",
  "Birthdays",
  "Anniversaries",
  "Girlfriend's Day",
  "Boyfriend's Day",
  "Friendship",
  "Best friends",
  "Family",
  "Just because",
  "Apologies",
];

function Row() {
  return (
    <>
      {words.map((word, i) => (
        <span key={word} className="flex items-center">
          <span
            className={cn(
              "px-[0.9em]",
              i % 2 ? "font-bold text-ink/80" : "font-bold text-ink/30",
            )}
          >
            {word}
          </span>
          <span className="size-[0.16em] rounded-full bg-rose/70" />
        </span>
      ))}
    </>
  );
}

/** A quiet, single-line ticker of occasions that drifts faster as you scroll. */
export function MarqueeBand() {
  return (
    <section aria-label="Occasions" className="mx-auto max-w-7xl px-5 py-14 md:py-20">
      <div className="border-y border-line py-7 text-[clamp(1.35rem,2.4vw,2rem)] uppercase leading-none tracking-[-0.03em] [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <VelocityMarquee baseVelocity={1.2} skew={false}>
          <Row />
        </VelocityMarquee>
      </div>
    </section>
  );
}
