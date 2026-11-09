import type { Metadata } from "next";
import { PolicySection, TextPage } from "@/components/sections/text-page";
import { giftPricing, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Refund and cancellation policy",
  description: "How refunds and cancellations work for TyniTales digital gifts: full refunds by email, back to your original payment method through Razorpay.",
  alternates: { canonical: "/refunds" },
};

const UPDATED = "9 November 2026";

export default function RefundsPage() {
  const { email } = siteConfig.contact;
  const mail = <a href={`mailto:${email}`}>{email}</a>;
  const price = `₹${giftPricing.pricePaise / 100}`;
  return (
    <TextPage
      eyebrow={`Last updated ${UPDATED}`}
      title="Refunds and"
      accent="cancellations."
      intro={<p>Each gift costs {price}, paid once. If something isn’t right, we’ll make it right or give your money back.</p>}
    >
      <PolicySection title="Full refunds">
        <p>
          If you’re not happy with your gift, or something didn’t work, email {mail} with your gift link (or the email you
          paid with) and we’ll refund you in full. No forms, no questions about why.
        </p>
      </PolicySection>

      <PolicySection title="Paid, but your gift didn’t go live">
        <p>
          If your payment went through but your gift link never appeared (say your phone lost signal), nothing is lost.
          Open the same template again while signed in and make it live: you won’t be charged a second time. Or write to
          us and we’ll refund you.
        </p>
      </PolicySection>

      <PolicySection title="How refunds are paid">
        <p>
          Refunds go back to the payment method you used (UPI, card, net banking or wallet) through Razorpay, our payment
          provider. They usually reach you within 5 to 7 working days of us approving them; your bank may take a little
          longer to show it.
        </p>
      </PolicySection>

      <PolicySection title="Cancellations">
        <p>
          A gift goes live the moment you pay, so there’s no order to cancel. You can change a live gift for{" "}
          {giftPricing.editDays} days, and ask for a refund instead if you’d rather. Once a gift is refunded, we may take
          its link down.
        </p>
      </PolicySection>

      <PolicySection title="Charged twice?">
        <p>Write to {mail}; any duplicate payment is refunded in full.</p>
      </PolicySection>
    </TextPage>
  );
}
