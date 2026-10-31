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
  {
    slug: "what-to-write-in-a-birthday-message",
    title: "What to write in a birthday message",
    accent: "that isn’t just HBD.",
    seoTitle: "What to Write in a Birthday Message (Examples for Every Person)",
    description:
      "Birthday wishes that sound like you, not a forward: a simple formula, and ready-to-adapt messages for your partner, best friend, Maa, Papa and siblings.",
    intro:
      "“Happy birthday! Have a great year 🎉” is fine. It’s also what everyone else sent. Here’s a simple way to write a birthday message that actually lands, with examples for the people you’re most likely writing to.",
    published: "2026-11-01",
    updated: "2026-11-01",
    occasion: "birthday",
    cta: {
      text: "Want it to feel like a surprise, not a text? Turn your message into a little birthday page with candles to blow out and your photos, timed to open at midnight.",
      label: "See birthday templates",
    },
    body: [
      { type: "h2", text: "The three-line formula", id: "formula" },
      {
        type: "p",
        text: "Almost every good birthday message does three small things. You don’t need more than a line for each.",
      },
      {
        type: "list",
        items: [
          "Something only you would say. A memory, an inside joke, a nickname, a thing they did this year that you noticed.",
          "What they mean to you, plainly. Not “you’re the best”, but why: “you’re the first person I call when something goes wrong”.",
          "A wish that fits them. Not “all the happiness in the world”, but “I hope this is the year you finally take that trip to Spiti”.",
        ],
      },
      {
        type: "note",
        text: "Quick test before you send: could this message be sent to anyone else in your contacts? If yes, add one detail that makes it only theirs.",
      },

      { type: "h2", text: "For your partner", id: "partner" },
      {
        type: "letter",
        label: "Girlfriend or boyfriend",
        lines: [
          "Happy birthday to the person who still laughs at my worst jokes and pretends my cooking is good.",
          "This year you took on a new job, a new city and me on my most dramatic days, and you made all of it look easy. I’m so proud of you.",
          "I hope this year is gentle with you, and that you finally get that window seat you keep talking about. I’ll be in the one next to it.",
        ],
        sign: "Love you, today and every day after",
      },

      { type: "h2", text: "For your best friend", id: "best-friend" },
      {
        type: "letter",
        label: "Best friend",
        lines: [
          "Happy birthday to the only person who knows the full story of what happened in Goa and has still never told anyone.",
          "Ten years, three cities and a thousand voice notes later, you’re still the person I want to tell everything to first.",
          "Have the loudest, happiest year. And reply to my texts like a normal human, just this once.",
        ],
        sign: "Yours till the group chat dies",
      },

      { type: "h2", text: "For Maa", id: "maa" },
      {
        type: "letter",
        label: "For Maa",
        lines: [
          "Happy birthday, Maa. I don’t say it enough, so I’m writing it down: thank you.",
          "For waking up before everyone, for the tiffin that was always ready, for pretending you weren’t worried every time I came home late.",
          "This year, I hope you do something just for yourself. And let someone else make the chai for once.",
        ],
        sign: "Your favourite child (don’t tell the others)",
      },

      { type: "h2", text: "For Papa", id: "papa" },
      {
        type: "letter",
        label: "For Papa",
        lines: [
          "Happy birthday, Papa. You taught me how to ride a cycle, how to save money and how to argue properly. All three have been very useful.",
          "I see more of you in myself every year, and I’m glad about that.",
          "Wishing you good health, long walks and a year with fewer things to fix around the house.",
        ],
        sign: "With love and respect",
      },

      { type: "h2", text: "For a brother or sister", id: "siblings" },
      {
        type: "letter",
        label: "Bhai or Didi",
        lines: [
          "Happy birthday to my first best friend and my first enemy, often on the same day.",
          "You’ve covered for me more times than I can count, and you’re still the only one I trust with the remote.",
          "Have an amazing year. Your gift is that I won’t tell Maa about the thing.",
        ],
        sign: "Your favourite sibling, obviously",
      },

      { type: "h2", text: "When they’re far away", id: "far-away" },
      {
        type: "p",
        text: "Distance makes timing matter more. Send it so it arrives at midnight their time, or the moment they wake up, and mention the distance once, warmly, without making it sad: “I hate that I’m not there to embarrass you with a cake, so here’s the next best thing.”",
      },

      { type: "h2", text: "Things to avoid", id: "avoid" },
      {
        type: "list",
        items: [
          "Forwarded quotes and long poems from the internet. They read as “I didn’t have time”.",
          "Jokes about age that might sting this particular person. You know which ones.",
          "Making it about you: “I can’t believe I forgot last year” belongs in a separate apology.",
          "Sending it at 11:58 pm the next day. Late is fine; pretending it isn’t late isn’t.",
        ],
      },
      {
        type: "p",
        text: "Short and specific beats long and generic every time. Three honest lines are a gift in themselves.",
      },
    ],
  },
  {
    slug: "how-to-say-sorry",
    title: "How to say sorry",
    accent: "and mean it.",
    seoTitle: "How to Say Sorry Properly (With Example Apology Messages)",
    description:
      "How to apologise to your girlfriend, boyfriend or best friend in a way that actually repairs things: what to say, what not to say, and real example messages.",
    intro:
      "A good apology isn’t about finding the perfect words. It’s about making the other person feel heard. Here’s what that looks like, step by step, with example messages you can adapt for your own situation.",
    published: "2026-11-01",
    updated: "2026-11-01",
    occasion: "apology",
    cta: {
      text: "When a text feels too small, say it with something you made: an apology page in your own words, with a few honest promises and a gentle way for them to answer.",
      label: "See apology templates",
    },
    body: [
      { type: "h2", text: "What a real apology has", id: "parts" },
      {
        type: "list",
        items: [
          "Name what you did. Not “I’m sorry for everything”, but “I’m sorry I cancelled on Saturday at the last minute”.",
          "Name how it affected them. “You’d planned the whole evening and I made it feel like it didn’t matter.”",
          "Own it, without a “but”. Anything after “but” cancels what came before it.",
          "Say what will change. One small, specific thing you will actually do.",
          "Give them space to answer. An apology isn’t a request for instant forgiveness.",
        ],
      },
      {
        type: "note",
        text: "Avoid “I’m sorry you feel that way” and “I’m sorry if I upset you”. Both quietly put the problem on them.",
      },

      { type: "h2", text: "Example: to your girlfriend", id: "girlfriend" },
      {
        type: "letter",
        label: "To her",
        lines: [
          "I’m sorry about last night. You were telling me about your day and I was on my phone the whole time.",
          "You noticed, and you were right to be hurt. It made you feel like what you said didn’t matter to me, and it does.",
          "From now on, when we’re talking, my phone goes face down. And I want to hear the rest of the story about your manager, properly this time.",
        ],
        sign: "I’m sorry. I love you.",
      },

      { type: "h2", text: "Example: to your boyfriend", id: "boyfriend" },
      {
        type: "letter",
        label: "To him",
        lines: [
          "I’m sorry for what I said in the car. I was stressed about work and I took it out on you, and that wasn’t fair.",
          "You were only trying to help, and I made you feel like the problem.",
          "Next time I’m having a bad day, I’ll tell you that, instead of picking a fight about the route.",
        ],
        sign: "Still your favourite passenger, hopefully",
      },

      { type: "h2", text: "Example: to your best friend", id: "best-friend" },
      {
        type: "letter",
        label: "To a friend",
        lines: [
          "I owe you an apology. I missed your birthday dinner and then went quiet instead of explaining. That’s worse than just missing it.",
          "You’ve shown up for me every single time, and I didn’t show up for you.",
          "Let me take you out this weekend, my treat, your choice of place. And I’ll be on time. Early, even.",
        ],
        sign: "Your very sorry friend",
      },

      { type: "h2", text: "Example: a short one, when it’s small", id: "short" },
      {
        type: "letter",
        label: "Short and sweet",
        lines: ["I was snappy with you earlier and you didn’t deserve it. Sorry. Chai’s on me tomorrow."],
        sign: "Me",
      },

      { type: "h2", text: "What to avoid", id: "avoid" },
      {
        type: "list",
        items: [
          "Explaining before apologising. Context can come later, if they ask for it.",
          "Over-apologising until they have to comfort you. Keep the focus on them.",
          "Grand promises you can’t keep. “It’ll never happen again” is easy to say and hard to believe.",
          "Gifts instead of words. A gift can go with an apology; it can’t replace one.",
          "Asking “are we okay now?” straight away. Give them the time they need.",
        ],
      },

      { type: "h2", text: "Text, call or in person?", id: "how" },
      {
        type: "p",
        text: "For something big, in person is best, and a message is a good way to open the door: “I want to apologise properly. Can we talk tonight?” For smaller things, or when they need space first, a thoughtful written apology lets them read it in their own time and reply when they’re ready.",
      },
      {
        type: "p",
        text: "However you send it, the words matter less than what you do afterwards. The apology is the start of making it right, not the end.",
      },
    ],
  },
];

export function getGuide(slug: string) {
  return guides.find((g) => g.slug === slug) ?? null;
}
