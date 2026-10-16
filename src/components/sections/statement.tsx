import { ScrollRevealText } from "@/components/motion/scroll-reveal-text";
import { Eyebrow } from "@/components/ui/eyebrow";

const points = ["Ready in minutes", "Private link, just for them", "Opens on any device"];

export function Statement() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-28 pt-16 md:pb-44 md:pt-24">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-3">
          <Eyebrow index="01">Our belief</Eyebrow>
        </div>
        <div className="md:col-span-9">
          <ScrollRevealText
            className="text-[clamp(1.9rem,4.2vw,3.9rem)] type-display leading-[0.92]"
            text="We believe the best gifts aren’t bought — they’re *written.* TyniTales turns the words you’ve been meaning to say into something they’ll *keep* *forever.*"
          />
          <ul className="type-label mt-14 flex flex-wrap gap-x-10 gap-y-3 text-muted">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-2.5">
                <span className="size-1.5 rounded-full bg-rose" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
