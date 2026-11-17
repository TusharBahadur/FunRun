import { Heart, Mail } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { FooterStickers } from "./footer-stickers";
import { occasions, siteConfig } from "@/config/site";

const columns = [
  {
    title: "Make",
    links: [
      { label: "Templates", href: "/templates" },
      { label: "How it works", href: "/#how" },
      { label: "Guides", href: "/guides" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
      { label: "Refunds", href: "/refunds" },
      { label: "Delivery", href: "/delivery" },
    ],
  },
  {
    title: "TyniTales",
    links: [
      { label: "About", href: "/about" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const { email, whatsapp, whatsappLabel } = siteConfig.contact;
const whatsappHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi TyniTales! I have a question:")}`;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3Z" />
    </svg>
  );
}

export function Footer() {
  return (
    // Full width, in a soft blush, with a "start gifting" banner on top.
    <footer className="mt-14 rounded-t-[2.5rem] bg-[color-mix(in_oklab,var(--color-blush)_55%,var(--color-paper))] text-ink md:mt-20">
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-6 sm:px-6 md:px-8 md:pt-10">
        <div className="flex flex-col items-center gap-5 rounded-[2rem] bg-paper shadow-[0_10px_30px_-18px_rgb(27_18_21/0.25)] px-6 py-8 text-center text-ink md:flex-row md:gap-8 md:px-10 md:text-left">
          <FooterStickers />
          <div className="flex-1">
            <p className="type-display text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.05]">
              Someone’s waiting <span className="type-accent whitespace-nowrap text-rose-deep">to hear it.</span>
            </p>
            <p className="mt-2 text-sm text-muted">Pick a template, pour your heart in, and send it in ten minutes.</p>
          </div>
          <ButtonLink href="/templates" size="lg" className="shrink-0">
            Start gifting
          </ButtonLink>
        </div>

        <div className="px-2 pt-12 md:px-0 md:pt-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_2fr] md:gap-16">
          <div>
            <Logo className="text-3xl" />
            <p className="type-copy mt-3 max-w-xs text-ink/65">Little digital gifts for the people who matter most.</p>
            <div className="mt-5 flex gap-2">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp us on ${whatsappLabel}`}
                className="grid size-10 place-items-center rounded-full border border-ink/15 text-ink/70 transition-colors hover:border-rose hover:text-rose"
              >
                <WhatsAppIcon className="size-[18px]" />
              </a>
              <a
                href={`mailto:${email}`}
                aria-label={`Email us at ${email}`}
                className="grid size-10 place-items-center rounded-full border border-ink/15 text-ink/70 transition-colors hover:border-rose hover:text-rose"
              >
                <Mail className="size-[18px]" />
              </a>
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {columns.map((c) => (
              <div key={c.title}>
                <p className="type-label mb-3 text-ink/45">{c.title}</p>
                <ul className="space-y-2.5 text-sm">
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-ink/75 transition-colors hover:text-rose-deep">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="type-label mb-3 text-ink/45">Gifts for</p>
              <ul className="space-y-2.5 text-sm">
                {occasions.slice(0, 4).map((o) => (
                  <li key={o.id}>
                    <Link href={`/templates/for/${o.id}`} className="text-ink/75 transition-colors hover:text-rose-deep">
                      {o.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/templates" className="text-rose-deep underline decoration-rose/40 underline-offset-4 hover:decoration-rose">
                    All occasions
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-1 border-t border-ink/10 pt-5 text-xs text-ink/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© TyniTales</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="size-3 fill-rose text-rose" /> in India
          </p>
        </div>
        </div>
      </div>
    </footer>
  );
}
