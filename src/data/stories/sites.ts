import { demoPhoto as photo, palettes, siteTemplate } from "./shared";

/*
 * Website gifts: one long scrolling page (photo hero, countdown, notes,
 * gallery, playlist, letter) instead of a game per page. Same copy rule as
 * the stories: write it the way the sender would actually say it.
 */

const board = (file: string) => `/stickers/board/${file}`;

/* ── Anniversary ── */
export const ourCorner = siteTemplate({
  slug: "our-corner",
  name: "Our Corner",
  occasion: "anniversary",
  description: "A little website about the two of you: a photo hero, a live countdown, things you’ve noticed, your photos, your songs and a letter.",
  pricePaise: 14900,
  palette: palettes.lilac,
  motif: "hearts",
  preview: { kicker: "Our website", title: "Made us a tiny website. Don’t laugh.", signoff: "A scrolling page · 6 sections" },
  recipient: "Aditi",
  sender: "Kabir",
  melody: "waltz",
  scenes: [
    {
      type: "hero",
      eyebrow: "Aditi & Kabir",
      title: "Three years, *still us.*",
      subtitle: "my favourite person",
      photo: photo("chai-hands"),
      tone: "dusk",
    },
    {
      type: "countdown",
      eyebrow: "Our next anniversary",
      date: "2027-02-14",
      title: "Not that I’m *counting.*",
      caption: "(I am.)",
    },
    {
      type: "noticed",
      eyebrow: "A few things I’ve noticed",
      title: "Three years in and I’m still finding *new things.*",
      items: [
        { title: "The laugh", text: "You laugh before I finish the joke, then I forget the joke. Honestly fine. I like your laugh more anyway." },
        { title: "The habits", text: "“Reached?” every single time. My hoodie, somehow always on you. 11pm chai. I’d notice if any of these stopped." },
        { title: "The feeling", text: "Like we’re heading somewhere good. Don’t know where exactly. Not in a rush either, because right now is already really nice." },
      ],
    },
    {
      type: "gallery",
      eyebrow: "Our tiny archive",
      title: "Three years of photos and I still can’t *pick a favourite.*",
      photos: [
        { caption: "Chai for two", date: "Every day", tone: "dusk", src: photo("chai-hands") },
        { caption: "Lonavala, in the rain", date: "Jul ’23", tone: "leaf", src: photo("misty-chai") },
        { caption: "Basically us", date: "Always", tone: "rose", src: board("07.jpg") },
        { caption: "That road trip", date: "Jan ’25", tone: "sun", src: photo("road-trip") },
        { caption: "Stargazing", date: "Feb ’25", tone: "night", src: photo("night-sky") },
      ],
    },
    {
      type: "playlist",
      eyebrow: "Songs for tonight",
      title: "Put one on. *Dim the lights.*",
      songs: [
        { title: "Tum Se Hi", note: "the one from our first long drive", tone: "dusk", src: board("06.jpg") },
        { title: "Kesariya", note: "for the slow part of the evening", tone: "night", src: photo("night-sky") },
        { title: "Raabta", note: "the one you sing wrong (cutely)", tone: "rose", src: board("07.jpg") },
      ],
    },
    {
      type: "letter",
      eyebrow: "And finally",
      title: "Us, still",
      paragraphs: [
        "Three years feels too short to describe what this has been. But it’s already more than I expected, in the best way.",
        "Thank you for the laughs, the long calls, the random voice notes, and every moment that made me think, okay, yeah, this is a good thing. I don’t say it out loud enough, so I put it on a website. Very normal.",
        "I don’t know exactly what comes next. I’m just really glad we’re figuring it out together.",
      ],
      signoff: "Happy anniversary. — Kabir",
    },
  ],
});

/* ── Love letter ── */
export const justForYou = siteTemplate({
  slug: "just-for-you",
  name: "Just For You",
  occasion: "love",
  description: "A love letter as a website: their photo up top, the little things you’ve noticed, your favourite pictures, your songs and the letter.",
  pricePaise: 14900,
  palette: palettes.blush,
  motif: "hearts",
  preview: { kicker: "A website, for you", title: "Couldn’t fit it in a text, so I made a website.", signoff: "A scrolling page · 5 sections" },
  recipient: "Meher",
  sender: "Arjun",
  melody: "lullaby",
  scenes: [
    {
      type: "hero",
      eyebrow: "For Meher",
      title: "I made you *a website.*",
      subtitle: "very normal behaviour",
      photo: photo("night-sky"),
      tone: "night",
    },
    {
      type: "noticed",
      eyebrow: "Things nobody tells you",
      title: "Stuff about you I think about *way too much.*",
      items: [
        { title: "How you hum", text: "When you cook, when you’re reading, when you think nobody’s listening. I’m always listening." },
        { title: "The way you say my name", text: "Especially when you’re half asleep. It sounds different. I like that version best." },
        { title: "How you make people feel", text: "Strangers leave a conversation with you feeling like old friends. I’ve watched it happen a hundred times." },
      ],
    },
    {
      type: "gallery",
      eyebrow: "Our camera roll",
      title: "Some of my *favourite* moments.",
      photos: [
        { caption: "Cutting chai, first date", date: "2022", tone: "dusk", src: photo("chai-cheers") },
        { caption: "Monsoon walk", date: "Jul ’24", tone: "leaf", src: photo("misty-chai") },
        { caption: "Us, accurately", date: "Always", tone: "rose", src: board("06.jpg") },
        { caption: "Late-night Maggi", date: "Too many nights", tone: "sun", src: photo("maggi-3am") },
      ],
    },
    {
      type: "playlist",
      eyebrow: "On repeat",
      title: "Songs that are basically *about you.*",
      songs: [
        { title: "Tum Se Hi", note: "you know why", tone: "dusk", src: photo("chai-cheers") },
        { title: "Pehli Nazar Mein", note: "embarrassingly accurate", tone: "rose", src: board("05.jpg") },
      ],
    },
    {
      type: "letter",
      eyebrow: "And finally",
      title: "Just for you",
      paragraphs: [
        "I’m bad at saying this stuff out loud. It always comes out wrong, or too much. So here it is, written down properly.",
        "You’re the calmest place I know. You make ordinary days feel like they matter. I love you, and I wanted you to have somewhere to come back to when you need reminding.",
      ],
      signoff: "Yours, Arjun",
      photo: photo("chai-hands"),
    },
  ],
});

/* ── Birthday ── */
export const birthdayPage = siteTemplate({
  slug: "birthday-page",
  name: "Birthday Page",
  occasion: "birthday",
  description: "A birthday website: their photo up top, a counter of every day they’ve been around, the things you love about them, photos, songs and a letter.",
  pricePaise: 14900,
  palette: palettes.peach,
  motif: "cake",
  preview: { kicker: "Happy birthday", title: "You get a whole website this year. Don’t get used to it.", signoff: "A scrolling page · 6 sections" },
  recipient: "Maya",
  sender: "Sam",
  melody: "birthday",
  scenes: [
    {
      type: "hero",
      eyebrow: "Happy birthday",
      title: "It’s *Maya’s* day.",
      subtitle: "officially 27",
      photo: photo("maya-portrait"),
      tone: "rose",
    },
    {
      type: "countdown",
      eyebrow: "You’ve been around for",
      date: "1999-10-18",
      title: "And honestly, every one of them *counted.*",
      caption: "The world’s been better since. Just saying.",
      nav: "Your days",
    },
    {
      type: "noticed",
      eyebrow: "27 things I love about you",
      title: "Okay, it’s *3.* The other 24 didn’t fit.",
      items: [
        { title: "You remember everything", text: "Everyone’s chai order, everyone’s birthday, that one thing I said in 2021. How??" },
        { title: "You show up", text: "2am, last minute, no questions asked. Every single time someone needs you." },
        { title: "Your laugh", text: "It’s loud and it’s the best sound in any room. Please never get quieter." },
      ],
    },
    {
      type: "gallery",
      eyebrow: "Year 27 in photos",
      title: "What a *year* you had.",
      photos: [
        { caption: "That road trip!!", date: "Jan ’25", tone: "sun", src: photo("road-trip") },
        { caption: "Cousin’s wedding", date: "Nov ’24", tone: "rose", src: photo("saree-laughs") },
        { caption: "Girls’ night", date: "Mar ’25", tone: "dusk", src: photo("party-girls") },
        { caption: "Last year’s cake", date: "Oct ’24", tone: "rose", src: photo("pink-cake") },
      ],
    },
    {
      type: "playlist",
      eyebrow: "Birthday playlist",
      title: "Turn it up. *It’s your day.*",
      songs: [
        { title: "London Thumakda", note: "for the dancing part", tone: "sun", src: photo("party-girls") },
        { title: "Badtameez Dil", note: "because obviously", tone: "rose", src: board("39.jpg") },
        { title: "Kabira", note: "for later, when it’s quiet", tone: "night", src: photo("chai-cheers") },
      ],
    },
    {
      type: "letter",
      eyebrow: "And finally",
      title: "Happy birthday",
      paragraphs: [
        "I didn’t know what to get you, so you’re getting a website. You’re welcome.",
        "You make everyone around you feel like they matter. I hope 27 gives some of that back to you. Say yes to the trip. Finish the painting. Let people spoil you a bit.",
      ],
      signoff: "Love you lots, Sam",
    },
  ],
});

/* ── Girlfriend’s Day ── */
export const fanPage = siteTemplate({
  slug: "fan-page",
  name: "Fan Page",
  occasion: "girlfriend-day",
  description: "A fan website for her: her photo up top, verified facts about her, a gallery, her playlist and a fan letter.",
  pricePaise: 14900,
  palette: palettes.wine,
  motif: "stars",
  preview: { kicker: "Official fan page", title: "Every celebrity has a fan page. So now you do too.", signoff: "A scrolling page · 5 sections" },
  recipient: "Zoya",
  sender: "Ishaan",
  melody: "sunny",
  scenes: [
    {
      type: "hero",
      eyebrow: "The official fan page",
      title: "Zoya: *the website.*",
      subtitle: "main character, obviously",
      photo: photo("saree-laughs"),
      tone: "rose",
    },
    {
      type: "noticed",
      eyebrow: "Verified facts",
      title: "Things about Zoya that are *simply true.*",
      items: [
        { title: "Best taste in music", text: "Not up for debate. Every playlist she makes is better than mine. I’ve stopped trying." },
        { title: "Notices everything", text: "New haircut, bad day, the one quiet moment in a loud room. She clocks it all." },
        { title: "Funniest person in the room", text: "Including rooms she isn’t in, because people quote her." },
      ],
    },
    {
      type: "gallery",
      eyebrow: "Fan cam",
      title: "Her best *moments*, as captured by her biggest fan.",
      photos: [
        { caption: "That wedding look", date: "Nov ’24", tone: "rose", src: photo("saree-laughs") },
        { caption: "Iconic, as usual", date: "Always", tone: "dusk", src: photo("maya-portrait") },
        { caption: "Girls’ night", date: "Mar ’25", tone: "sun", src: photo("party-girls") },
        { caption: "Me, looking at her", date: "Daily", tone: "rose", src: board("43.jpg") },
      ],
    },
    {
      type: "playlist",
      eyebrow: "Her playlist",
      title: "Approved by Zoya. *Mostly.*",
      songs: [
        { title: "Ilahi", note: "her road trip song, no skipping", tone: "sun", src: photo("road-trip") },
        { title: "Tera Ban Jaunga", note: "this one’s from me", tone: "rose", src: board("44.jpg") },
      ],
    },
    {
      type: "letter",
      eyebrow: "A letter from your #1 fan",
      title: "Dear Zoya",
      paragraphs: [
        "I’ve been your fan since the first time you laughed at my bad joke. And it was a really bad joke.",
        "Happy Girlfriend’s Day. Thanks for being exactly you, loudly. The fan club meets daily. Membership: me.",
      ],
      signoff: "Your #1 fan, Ishaan",
    },
  ],
});
