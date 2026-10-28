import { Heart } from "lucide-react";
import Link from "next/link";
import { SplitText } from "@/components/motion/split-text";
import { Logo } from "@/components/ui/logo";
import { RollText } from "@/components/ui/roll-text";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Templates", href: "/templates" },
      { label: "How it works", href: "/#how" },
      { label: "Details", href: "/#features" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Journal", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-3 overflow-hidden rounded-t-[2.5rem] bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-5 pt-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo className="text-4xl" />
            <p className="type-copy mt-5 max-w-xs text-cream/75">
              Beautiful digital gifts for the people who matter most.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <p className="type-label text-cream/40">
                {col.title}
              </p>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="group whitespace-nowrap text-cream/80 hover:text-cream">
                      <RollText>{link.label}</RollText>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p
          aria-hidden
          className="mt-16 select-none text-center type-wordmark whitespace-nowrap pb-[0.12em] text-[clamp(3rem,19vw,26rem)] leading-[0.9] text-cream"
        >
          <SplitText text="TyniTales" by="char" stagger={0.06} />
          <span className="text-rose">.</span>
        </p>

        <div className="type-label flex flex-col gap-2 border-t border-cream/10 py-6 text-cream/45 md:flex-row md:justify-between">
          <p>© TyniTales. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with <Heart className="size-3.5 fill-rose text-rose" /> for the ones we love.
          </p>
        </div>
      </div>
    </footer>
  );
}
