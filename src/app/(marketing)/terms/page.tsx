import type { Metadata } from "next";
import Link from "next/link";
import { PolicySection, TextPage } from "@/components/sections/text-page";
import { giftPricing, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description: "The terms for making and sending gifts with TyniTales, including pricing, delivery, refunds and acceptable use.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "30 October 2026";

export default function TermsPage() {
  const { email } = siteConfig.contact;
  const mail = <a href={`mailto:${email}`}>{email}</a>;
  const price = `₹${giftPricing.pricePaise / 100}`;
  return (
    <TextPage
      eyebrow={`Last updated ${UPDATED}`}
      title="Terms and"
      accent="conditions."
      intro={
        <p>
          These terms apply when you use TyniTales (tynitales.com), run by Tushar Bahadur in India. By using the site you
          agree to them. We’ve tried to keep them plain.
        </p>
      }
    >
      <PolicySection title="The service">
        <p>
          TyniTales lets you personalise a digital gift template and share it as a private link. You can try and edit any
          template for free. Making a gift live gives you its link.
        </p>
      </PolicySection>

      <PolicySection title="Your account">
        <p>
          You need to sign in to make a gift live. Keep your account secure; you’re responsible for what’s done with it.
          You must be 18 or over, or have a parent or guardian’s permission.
        </p>
      </PolicySection>

      <PolicySection title="Price and payment">
        <p>
          Making a gift live costs {price} per gift, inclusive of any applicable taxes, paid once. There are no
          subscriptions or hidden charges. Payments are processed by Razorpay, and their terms apply to the payment. Prices
          may change in future, but never for a gift you’ve already paid for.
        </p>
      </PolicySection>

      <PolicySection title="Delivery">
        <p>
          TyniTales is a digital service: nothing is shipped. Your gift link is delivered on screen as soon as payment
          succeeds (and appears in your profile). If you schedule a gift, the link works straight away and shows a countdown
          until the time you chose.
        </p>
      </PolicySection>

      <PolicySection title="Refunds and cancellations">
        <p>
          If you’re not happy with your gift, or something didn’t work, email {mail} with your gift link and we’ll refund
          you in full. Refunds go back to your original payment method through Razorpay, usually within 5 to 7 working days.
          Once a gift is refunded, we may take its link down.
        </p>
      </PolicySection>

      <PolicySection title="How long gifts stay online">
        <p>
          Live gift links don’t expire. You can change a gift for {giftPricing.editDays} days after it goes live. We’ll keep
          your gifts online for as long as we run TyniTales; if we ever had to close, we’d give you notice and a way to save
          what you made.
        </p>
      </PolicySection>

      <PolicySection title="Your content">
        <p>
          You own what you put into your gifts. You give us permission to store it, process it and show it to people who have
          the link, only so we can provide the service. Please only upload photos and words you have the right to use, and
          be thoughtful about including other people’s photos or personal details.
        </p>
      </PolicySection>

      <PolicySection title="What’s not allowed">
        <ul>
          <li>Anything illegal, hateful, threatening, harassing or sexually explicit</li>
          <li>Content involving minors that is inappropriate in any way</li>
          <li>Impersonating someone, scams, phishing or spam</li>
          <li>Other people’s copyrighted material you don’t have permission to use</li>
          <li>Trying to break, overload or misuse the service</li>
        </ul>
        <p>We may remove gifts or close accounts that break these rules, without a refund where the misuse is serious.</p>
      </PolicySection>

      <PolicySection title="Our templates">
        <p>
          The templates, designs, illustrations, stickers and code are ours or licensed to us. You can use them inside your
          TyniTales gifts, but not copy them to resell or reuse elsewhere.
        </p>
      </PolicySection>

      <PolicySection title="Things we can’t promise">
        <p>
          We work hard to keep TyniTales running smoothly, but it’s provided “as is”. We can’t guarantee it will always be
          available or error-free, or that a gift will look identical on every device. As far as the law allows, our total
          liability for any claim is limited to the amount you paid for the gift concerned.
        </p>
      </PolicySection>

      <PolicySection title="Privacy">
        <p>
          How we handle personal data is explained in our <Link href="/privacy">privacy policy</Link>.
        </p>
      </PolicySection>

      <PolicySection title="Changes, law and contact">
        <p>
          We may update these terms; the date at the top shows the latest version, and continuing to use TyniTales means you
          accept it. These terms are governed by the laws of India, and disputes are subject to the jurisdiction of Indian
          courts. Questions: {mail}.
        </p>
      </PolicySection>
    </TextPage>
  );
}
