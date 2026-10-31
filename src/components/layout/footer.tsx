import { Heart, Mail } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { occasions, siteConfig } from "@/config/site";
import { EnquiryForm } from "./enquiry-form";

const links = [
  { label: "Templates", href: "/templates" },
  { label: "How it works", href: "/#how" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
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
    <footer className="px-3 pb-3">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-line bg-paper px-6 py-10 md:px-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <div>
            <Logo className="text-3xl" />
            <p className="type-copy mt-3 max-w-sm text-muted">
              Little digital gifts for the people who matter most. Questions, or want something made just for you? Say hi.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-rose h-11 px-5 text-sm">
                <WhatsAppIcon className="size-4" /> WhatsApp us
              </a>
              <a href={`mailto:${email}`} className="btn btn-paper h-11 px-5 text-sm">
                <Mail className="size-4" /> Email us
              </a>
            </div>
            <p className="mt-4 text-sm text-muted">
              <span className="whitespace-nowrap">{whatsappLabel}</span>
              <span aria-hidden className="mx-2 text-line">•</span>
              <a href={`mailto:${email}`} className="break-all underline decoration-line underline-offset-4 hover:text-ink hover:decoration-ink/40">
                {email}
              </a>
            </p>
          </div>

          <div>
            <p className="type-label mb-3 text-muted">Send us a note</p>
            <EnquiryForm />
          </div>
        </div>

        {/* Every occasion page, linked from every page. */}
        <nav aria-label="Gifts by occasion" className="mt-10 border-t border-line pt-6">
          <p className="type-label mb-3 text-muted">Gifts for</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {occasions.map((o) => (
              <li key={o.id}>
                <Link href={`/templates/for/${o.id}`} className="text-muted transition-colors hover:text-ink">
                  {o.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-6 flex flex-col gap-4 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-muted transition-colors hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            © TyniTales · Made with <Heart className="size-3.5 fill-rose text-rose" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
}
