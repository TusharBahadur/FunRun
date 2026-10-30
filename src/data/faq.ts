/** Questions people actually ask. Used by /faq and its FAQPage structured data. */
export type Faq = { q: string; a: string };
export type FaqGroup = { title: string; items: Faq[] };

export const faqGroups: FaqGroup[] = [
  {
    title: "The basics",
    items: [
      {
        q: "What is TyniTales?",
        a: "TyniTales lets you make a personalised digital gift: a little website for one person, with your photos, your words, small games and a letter at the end. You send it as a private link, and they open it on their phone or laptop.",
      },
      {
        q: "What can I make with it?",
        a: "Birthday surprises, anniversary gifts, love letters, Friendship Day and best friend gifts, apologies, and gifts for family like Maa, Papa, Bhai or Didi. Each template has its own little moments, like blowing out candles, popping balloons, unsealing a letter or a quiz about the two of you.",
      },
      {
        q: "Does the person I send it to need an app or an account?",
        a: "No. They just tap the link. It opens in any browser on any phone, tablet or computer, with nothing to install and no sign-up.",
      },
      {
        q: "How long does it take to make one?",
        a: "Most people finish in a few minutes: change the names, swap in your photos, edit the lines you want to say in your own words, and it’s ready. You can take as long as you like though; your draft saves on your device as you go.",
      },
    ],
  },
  {
    title: "Price and payment",
    items: [
      {
        q: "How much does a digital gift cost?",
        a: "Trying any template and editing it is free. Making a gift live, so you get a link to send, costs ₹99 per gift, paid once. There’s no subscription.",
      },
      {
        q: "How do I pay?",
        a: "Payments are handled securely by Razorpay, so you can pay with UPI, cards, net banking or wallets. We never see or store your card or bank details.",
      },
      {
        q: "Can I get a refund?",
        a: "Yes. If something isn’t right, email us with your gift link and we’ll refund you in full. Refunds go back to the way you paid, usually within 5 to 7 working days.",
      },
    ],
  },
  {
    title: "Sending your gift",
    items: [
      {
        q: "How do I send the gift?",
        a: "When your gift is live you get one private link. Send it however you like: WhatsApp, Instagram, a text or email. You can also open it together on your phone.",
      },
      {
        q: "Can I schedule it to open at midnight?",
        a: "Yes. When you make it live, choose a date and time. Before then the link shows a countdown, and the gift opens right on time, which is perfect for a midnight birthday surprise.",
      },
      {
        q: "Can I add a password?",
        a: "Yes, you can lock your gift with a password (at least 4 characters) so only the person who knows it can open it. Share the password separately, or make it something only they would know.",
      },
      {
        q: "Will I know when they open it?",
        a: "Yes. Sign in and you’ll see whether your gift has been opened, when it was first opened, and how many times.",
      },
      {
        q: "How long does the link stay online?",
        a: "For good. Your gift link doesn’t expire, so they can come back to it on every birthday or anniversary.",
      },
      {
        q: "Can I change the gift after sending it?",
        a: "Yes, for 7 days after it goes live. Fix a typo, swap a photo or add a line, and the same link updates.",
      },
    ],
  },
  {
    title: "Privacy",
    items: [
      {
        q: "Who can see my gift?",
        a: "Only people who have the link (and the password, if you set one). Gift pages are hidden from Google and other search engines, and we never list them anywhere.",
      },
      {
        q: "What happens to my photos?",
        a: "While you’re editing, photos stay on your device. When you make the gift live, the photos in it are uploaded so the person you send it to can see them. They’re used only for your gift, and deleting your account deletes them.",
      },
      {
        q: "Can I delete a gift or my account?",
        a: "Yes. You can delete your account from your profile, which removes your gifts and their photos. If you want a single gift taken down, email us its link.",
      },
    ],
  },
];
