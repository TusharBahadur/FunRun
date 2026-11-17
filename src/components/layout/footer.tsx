import { Heart, Mail } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
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
    // Full width, in the brand rose. On the home page it continues the call to action above it.
    <footer className="mt-14 rounded-t-[2.5rem] bg-rose-deep text-paper md:mt-20 [body:has(#cta)_&]:mt-0 [body:has(#cta)_&]:rounded-none">
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-6 md:px-12 md:pt-16 [body:has(#cta)_&]:border-t [body:has(#cta)_&]:border-paper/15">
        <div className="grid gap-10 md:grid-cols-[1.4fr_2fr] md:gap-16">
          <div>
            <Logo className="text-3xl [&>span]:text-ink" />
            <p className="type-copy mt-3 max-w-xs text-paper/75">Little digital gifts for the people who matter most.</p>
            <div className="mt-5 flex gap-2">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp us on ${whatsappLabel}`}
                className="grid size-10 place-items-center rounded-full border border-paper/30 text-paper transition-colors hover:bg-paper hover:text-rose-deep"
              >
                <WhatsAppIcon className="size-[18px]" />
              </a>
              <a
                href={`mailto:${email}`}
                aria-label={`Email us at ${email}`}
                className="grid size-10 place-items-center rounded-full border border-paper/30 text-paper transition-colors hover:bg-paper hover:text-rose-deep"
              >
                <Mail className="size-[18px]" />
              </a>
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {columns.map((c) => (
              <div key={c.title}>
                <p className="type-label mb-3 text-paper/60">{c.title}</p>
                <ul className="space-y-2.5 text-sm">
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-paper/90 transition-colors hover:text-paper hover:underline hover:underline-offset-4">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="type-label mb-3 text-paper/60">Gifts for</p>
              <ul className="space-y-2.5 text-sm">
                {occasions.slice(0, 4).map((o) => (
                  <li key={o.id}>
                    <Link href={`/templates/for/${o.id}`} className="text-paper/90 transition-colors hover:text-paper hover:underline hover:underline-offset-4">
                      {o.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/templates" className="text-paper underline decoration-paper/40 underline-offset-4 hover:decoration-paper">
                    All occasions
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-1 border-t border-paper/15 pt-5 text-xs text-paper/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© TyniTales</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="size-3 fill-paper text-paper" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
}
