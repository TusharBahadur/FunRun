import type { BirthdayGift } from "@/components/experiences/birthday/types";

/**
 * Sample content shown when someone previews a template. Real gifts will be
 * loaded from the database with the sender's own words and photos.
 */
export const demoBirthdayGift: BirthdayGift = {
  recipient: "Maya",
  sender: "Sam",
  age: 27,
  shortNote:
    "Happy birthday, Maya! Another year of your laugh, your terrible puns and your big heart. Hope today is as lovely as you are.",
  message: [
    "Another year of you, and somehow you keep getting better at it. The laugh that fills a whole room, the way you remember everyone's coffee order, the terrible puns you refuse to apologise for.",
    "I hope this year is soft where you need it to be and loud where you want it to be. I hope you say yes to the trip, finish the painting, and let people spoil you a little.",
    "Thank you for being exactly who you are. I'm so lucky I get to watch you grow into who you're becoming.",
  ],
  memories: [
    { caption: "That lake day", date: "Aug 2025", tone: "sea" },
    { caption: "Your 26th, round two", date: "Mar 2026", tone: "rose" },
    { caption: "Sunrise on the drive home", date: "Jun 2026", tone: "sun" },
    { caption: "Stargazing, mostly talking", date: "Oct 2025", tone: "night" },
  ],
  timeline: [
    { month: "Jan", caption: "New year, same us", tone: "night" },
    { month: "Feb", caption: "The pottery class", tone: "dusk" },
    { month: "Mar", caption: "Your 26th", tone: "rose" },
    { month: "Apr", caption: "Rain, chai, Maggi", tone: "sea" },
    { month: "May", caption: "Goa, finally", tone: "sun" },
    { month: "Jun", caption: "Sunrise drive", tone: "sun" },
    { month: "Jul", caption: "Monsoon walks", tone: "leaf" },
    { month: "Aug", caption: "Lake day", tone: "sea" },
    { month: "Sep", caption: "New job!", tone: "dusk" },
    { month: "Oct", caption: "Stargazing", tone: "night" },
    { month: "Nov", caption: "Diwali lights", tone: "sun" },
    { month: "Dec", caption: "Cookies, burnt", tone: "rose" },
  ],
  voiceNote: {
    transcript:
      "Hey Maya! Happy birthday! I wanted you to hear this in my voice. You're one of my favourite people in the whole world. Have the best day. Love you!",
    seconds: 14,
  },
  song: { title: "Our song", artist: "Picked by Sam" },
  wishes: [
    { name: "Priya", kind: "text", message: "27 looks so good on you! Can't wait to celebrate this weekend 🎂" },
    { name: "Arjun", kind: "photo", tone: "sun", message: "Goa trip, part two? You're planning it." },
    { name: "Mom", kind: "voice", message: "A little song from home." },
    { name: "Neha", kind: "text", message: "To the person who always remembers everyone else's birthday: today it's yours. Love you lots!" },
    { name: "Rohan", kind: "text", message: "Happy birthday! Still owe you that rematch." },
    { name: "Zoya", kind: "photo", tone: "rose", message: "Best plus-one at every wedding. Happy birthday!" },
    { name: "Kabir", kind: "voice", message: "Played you a little something on the guitar." },
    { name: "Ananya", kind: "text", message: "Wishing you a year as warm as your hugs." },
    { name: "Dev", kind: "text", message: "Happy birthday Maya!! Drinks on me (one drink)." },
    { name: "Ishaan", kind: "photo", tone: "leaf", message: "Hiking buddy forever." },
    { name: "Tara", kind: "text", message: "You make every room brighter. Have the loveliest day." },
    { name: "Meera", kind: "text", message: "Happiest birthday to my favourite human!" },
  ],
};
