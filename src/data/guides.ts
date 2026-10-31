import type { OccasionId } from "@/config/site";

/**
 * Guides: helpful articles for things people search before making a gift
 * (how to write a love letter, birthday messages, apologies…). Each one should
 * genuinely answer the question; the gift is offered at the end, not pushed.
 */
export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id: string }
  | { type: "list"; items: string[] }
  | { type: "letter"; label: string; lines: string[]; sign: string }
  | { type: "note"; text: string };

export type Guide = {
  slug: string;
  title: string;
  /** The part of the H1 shown in the accent style. */
  accent: string;
  /** Search result title (" · TyniTales" is added). */
  seoTitle: string;
  description: string;
  intro: string;
  published: string;
  updated: string;
  /** The occasion whose templates the guide leads to. */
  occasion: OccasionId;
  cta: { text: string; label: string };
  body: GuideBlock[];
};

export const guides: Guide[] = [
  {
    slug: "how-to-write-a-love-letter",
    title: "How to write a love letter",
    accent: "they’ll keep.",
    seoTitle: "How to Write a Love Letter That Makes Them Cry (With Examples)",
    description:
      "A simple way to write a deep, emotional love letter for your girlfriend or boyfriend, with full example letters you can adapt, what to avoid, and how to give it.",
    intro:
      "You don’t need to be a writer. The letters that make people cry aren’t the poetic ones; they’re the specific ones. Here’s a simple way to write yours, with full examples for her, for him, from far away, and for when you’re saying sorry.",
    published: "2026-10-31",
    updated: "2026-10-31",
    occasion: "love",
    cta: {
      text: "Written it? Give it the moment it deserves: send it as a sealed digital letter they open on their phone, with your photos tucked between the pages.",
      label: "See love letter templates",
    },
    body: [
      { type: "h2", text: "What makes a love letter emotional", id: "what-makes-it-emotional" },
      {
        type: "p",
        text: "Big words like “forever”, “soulmate” and “my everything” sound lovely, but everyone uses them, so they slide past. What actually gets someone is proof that you notice them: a moment only you two were there for, a habit of theirs you secretly love, a thing they said once that you still think about.",
      },
      {
        type: "p",
        text: "So the rule for the whole letter is simple: be specific. “You make me happy” is nice. “You make me happy, like the night the power went out and we ate Maggi by phone torchlight and you made it feel like a date” is the line they’ll read twice.",
      },

      { type: "h2", text: "A simple structure that works", id: "structure" },
      { type: "p", text: "You don’t need a template, but a shape helps. Most good love letters do these five things, roughly in this order:" },
      {
        type: "list",
        items: [
          "Start with them, not with you. Open with a moment, an image or a direct “I’ve been meaning to tell you…”. Skip “Hi, how are you”.",
          "Bring back one memory, in detail. Where you were, what they wore, what was said. One vivid memory beats five vague ones.",
          "Tell them what you notice. Two or three small, true things you love about them: how they laugh at their own jokes, how they always save you the last bite.",
          "Say what they’ve changed in you. This is the part that lands hardest. Who were you before them, and who are you now?",
          "End looking forward. A plan, a promise you can actually keep, or a simple “I choose you, again and again.”",
        ],
      },
      {
        type: "note",
        text: "Write it in the language you two actually talk in. If your “I love you” usually comes out in Hindi, Tamil, Bengali or a mix, write it that way. It will sound like you, and that is the whole point.",
      },

      { type: "h2", text: "Example: a love letter for your girlfriend", id: "for-girlfriend" },
      { type: "p", text: "Change the details to yours. The shape is what matters." },
      {
        type: "letter",
        label: "For her",
        lines: [
          "I’ve tried to write this three times, and every time I ended up just thinking about you instead of writing. So I’m going to keep it simple.",
          "Do you remember the day we got stuck at the bus stop in the rain, and you made us play “guess the stranger’s story” for forty minutes? I didn’t care about the rain. I remember thinking, I could do this with her for the rest of my life. I still think it.",
          "I love the way you get completely serious about tiny things, like which mango is the best one. I love that you text me “reached” every single time, even when it’s just your own house. I love that you laugh before you finish your own jokes.",
          "Before you, I was good at being fine. You made me better at being happy. You made me want to call my mom more, sleep on time and actually be brave about things.",
          "I don’t know everything about our future yet, but I know I want you in every version of it.",
        ],
        sign: "Always yours, even when you steal my hoodie",
      },

      { type: "h2", text: "Example: a deep, emotional love letter for your boyfriend", id: "for-boyfriend" },
      {
        type: "letter",
        label: "For him",
        lines: [
          "You’re not great at hearing nice things about yourself, so I’ve written them down. Now you have to read them.",
          "I think about the night you drove forty minutes just because I said I’d had a bad day, and then pretended you were “in the area anyway”. You weren’t. I knew. I’ve never felt so looked after.",
          "I love how you hum when you cook. I love that you remember the names of my friends’ pets. I love how calm you get when I’m panicking, like the problem is already solved because you’re there.",
          "You make the ordinary days the best part. Not the trips, not the big plans: the chai on the balcony, the arguing over what to watch, the falling asleep mid-sentence.",
          "Thank you for loving me loudly on the days I’m quiet, and quietly on the days I’m loud. I’m so proud of the man you are, and so lucky that you’re mine.",
        ],
        sign: "Yours, completely",
      },

      { type: "h2", text: "Example: a love letter when you’re far apart", id: "long-distance" },
      {
        type: "letter",
        label: "From far away",
        lines: [
          "It’s 11:40 here, and I know you’re already asleep, so this will be the first thing you read today.",
          "Distance is strange. Some days it feels like nothing: we’re on call, you’re telling me about your weird manager, and it’s like you’re in the next room. Other days I see a couple sharing an umbrella and I miss you so much it’s almost funny.",
          "I keep a list on my phone of things I want to do when we’re in the same city again. It has 43 things on it now. Number one is just sitting next to you and doing absolutely nothing.",
          "Thank you for choosing us, even when it’s inconvenient, even when the time zones are rude. Every day I don’t see you is one day closer to the day I do.",
        ],
        sign: "Counting down, always",
      },

      { type: "h2", text: "Example: a love letter that says sorry", id: "sorry" },
      {
        type: "p",
        text: "An apology letter works when it’s about them, not about defending yourself. Name what happened, own it, and say what will be different. Leave out “but” and “if you felt”.",
      },
      {
        type: "letter",
        label: "When you’re sorry",
        lines: [
          "I’m sorry about Saturday. I said I was too tired to talk, and then I spent an hour on my phone. You noticed, and you were right to be hurt.",
          "It wasn’t about you. But it made you feel like you weren’t a priority, and that matters more than what I meant.",
          "Here’s what I’m going to do: when I’m drained, I’ll tell you that instead of disappearing. And Saturday nights are ours again, phone in the other room.",
          "I love you, and I don’t want you to ever have to wonder about that.",
        ],
        sign: "Still and always yours",
      },

      { type: "h2", text: "Things to avoid", id: "avoid" },
      {
        type: "list",
        items: [
          "Copying lines from the internet. They can tell, and it makes the true parts feel borrowed too. Use examples like these for the shape, then write your own details.",
          "Making it about how much you’ve sacrificed, or comparing them with an ex. Keep the spotlight on them.",
          "Writing an essay. Five honest paragraphs are better than three pages. If it’s long, it should be because you had a lot of specific things to say.",
          "Promises you can’t keep. “I’ll never make you sad again” isn’t true for anyone. “I’ll always listen when you are” is.",
          "Over-editing. A slightly messy sentence that’s true beats a perfect one that sounds rehearsed.",
        ],
      },

      { type: "h2", text: "How to give it", id: "how-to-give-it" },
      {
        type: "list",
        items: [
          "Handwritten: still the most personal. Hide it somewhere they’ll find it later: a jacket pocket, a book they’re reading, their laptop bag.",
          "Read it aloud: if you can get through it without your voice cracking, you’re braver than most. If it cracks, even better.",
          "As a digital letter: if you’re apart, or you want to add photos and a song, send it as a link they open on their phone, timed for midnight or the moment they wake up.",
        ],
      },
      {
        type: "p",
        text: "Whatever you choose, the hard part is already done: you sat down and told them what they mean to you. Most people never do.",
      },
    ],
  },
];

export function getGuide(slug: string) {
  return guides.find((g) => g.slug === slug) ?? null;
}
