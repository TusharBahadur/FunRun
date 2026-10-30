import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { TextPage } from "@/components/sections/text-page";
import { siteConfig } from "@/config/site";
import { faqGroups } from "@/data/faq";

export const metadata: Metadata = {
  title: "FAQ: personalised digital gifts, explained",
  description:
    "How TyniTales digital gifts work: price (₹99, once), paying with UPI via Razorpay, scheduling a midnight surprise, passwords, refunds, privacy and how long your link stays online.",
  alternates: { canonical: "/faq" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqGroups.flatMap((g) =>
    g.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  ),
};

export default function FaqPage() {
  const { email, whatsapp } = siteConfig.contact;
  return (
    <TextPage
      eyebrow="FAQ"
      title="Questions,"
      accent="answered."
      intro={<p>Everything people ask before making their first gift. Can’t find yours? Write to us at the bottom of the page.</p>}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="space-y-12">
        {faqGroups.map((g) => (
          <section key={g.title}>
            <h2 className="type-label mb-3 text-muted">{g.title}</h2>
            <div className="divide-y divide-line rounded-3xl border border-line bg-paper">
              {g.items.map((f) => (
                <details key={f.q} className="group px-5 md:px-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[16px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                    <h3>{f.q}</h3>
                    <ChevronDown className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="pb-5 text-[15px] leading-relaxed text-ink/75">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="mt-12 text-[15px] text-muted">
        Still wondering about something?{" "}
        <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-ink underline decoration-line underline-offset-4">
          WhatsApp us
        </a>{" "}
        or email{" "}
        <a href={`mailto:${email}`} className="text-ink underline decoration-line underline-offset-4">
          {email}
        </a>
        .
      </p>
    </TextPage>
  );
}
