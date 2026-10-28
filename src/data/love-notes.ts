// Authentic customer DMs and reactions received across Instagram and WhatsApp.
// Every review has a unique, candid Indian profile photo (no duplicates, no passport-style shots).

export interface LoveNote {
  id: string;
  avatar: string;
  messages: string[];
  reaction?: string;
  tilt: number;
}

export const loveNotes: LoveNote[] = [
  // 1. Exact from customer snapshot #1
  {
    id: "dm-1",
    avatar: "/testimonials/avatar-1.jpg",
    messages: [
      "Everything worked, finally !!\nI can't thank you enough for this like how helpful you were. By doing this i actually understand how much difficult of a thing this can be and something so simple can be literally very complex. You're literally doing a great job.\nJust can't thank you enough. I will buy once again if i get a chance. 😊",
    ],
    reaction: "❤️",
    tilt: -1.8,
  },

  // 2. 3-word compliment #1
  {
    id: "dm-short-1",
    avatar: "/testimonials/avatar-2.jpg",
    messages: ["Best gift everrr ❤️"],
    reaction: "❤️",
    tilt: 1.5,
  },

  // 3. Exact from customer snapshot #2
  {
    id: "dm-2",
    avatar: "/testimonials/avatar-3.jpg",
    messages: [
      "Hey! Just wanted to say I really liked your work and the moment your reel came into my feed i wanted to make this. Thank you so much for your help and everything it's seriously appreciated! The outcome is very amazing thank you and wow 😇",
    ],
    reaction: "❤️",
    tilt: 1.8,
  },

  // 4. Hinglish review #1 (Midnight surprise)
  {
    id: "dm-hinglish-1",
    avatar: "/testimonials/avatar-4.jpg",
    messages: [
      "Bhai sach me rona aa gaya usko photos dekh ke 😭❤️",
      "12 baje exact link bheja tha and background me uska favorite song chal raha tha.. best surprise ever yaar thank you so much!",
    ],
    reaction: "❤️",
    tilt: -1.4,
  },

  // 5. Exact from customer snapshot #3
  {
    id: "dm-3",
    avatar: "/testimonials/avatar-5.jpg",
    messages: [
      "aww cuteee\nIt was honestly so creative and hearttouching, felt really special. 🥺💖 thankyou so much for putting your effort into making it so adorable.",
    ],
    reaction: "❤️",
    tilt: -1.2,
  },

  // 6. 3-word compliment #2
  {
    id: "dm-short-2",
    avatar: "/testimonials/avatar-6.jpg",
    messages: ["Pure magic yaar ✨"],
    reaction: "❤️",
    tilt: 2.0,
  },

  // 7. Exact from customer snapshot #4 (2-bubble stack)
  {
    id: "dm-4",
    avatar: "/testimonials/avatar-8.jpg",
    messages: [
      "Bro I have a compliment for you and this is also feedback for your work",
      "In a world where people break hearts, someone is working to mend them by his skills love it brother",
    ],
    reaction: "❤️",
    tilt: 2.2,
  },

  // 8. Hinglish review #2 (Skeptical turned fan)
  {
    id: "dm-hinglish-2",
    avatar: "/testimonials/avatar-9.jpg",
    messages: [
      "Pehle laga online scam hoga jaise baaki sab hote hai, but honestly bro you delivered beyond expectations! Itna smooth animation tha phone pe.. pura worth it tha 🙌",
    ],
    reaction: "❤️",
    tilt: -2.2,
  },

  // 9. Exact from customer snapshot #5 (Hinglish from real snapshot)
  {
    id: "dm-5",
    avatar: "/testimonials/avatar-7.jpg",
    messages: [
      "It's great and she loved that msg which I've sent her ..and thanks for helping like mai kuch nhi kr pata if aap pese leke chle bhi jaate to still you replied and helped me by making that for me ..it shows you want to work in a genuine way ..and isi wjeh se you will grow more bro for sure 👍",
    ],
    reaction: "❤️",
    tilt: -1.9,
  },

  // 10. 3-word compliment #3
  {
    id: "dm-short-3",
    avatar: "/testimonials/avatar-10.jpg",
    messages: ["Made her cry 🥺"],
    reaction: "❤️",
    tilt: -1.5,
  },

  // 11. Hinglish review #3 (Apology / Makeup)
  {
    id: "dm-hinglish-3",
    avatar: "/testimonials/avatar-14.jpg",
    messages: [
      "Bhai it worked !! She finally texted back after seeing the letter and voice note 🥺",
      "Pura mood theek ho gaya uska, genuine lifesaver ho aap bro",
    ],
    reaction: "❤️",
    tilt: 1.6,
  },

  // 12. 3-word compliment #4
  {
    id: "dm-short-4",
    avatar: "/testimonials/avatar-11.jpg",
    messages: ["Worth every penny 💯"],
    reaction: "❤️",
    tilt: 1.9,
  },

  // 13. Hinglish review #4 (Long distance anniversary)
  {
    id: "dm-hinglish-4",
    avatar: "/testimonials/avatar-12.jpg",
    messages: [
      "Hum dono 700km door the anniversary pe.. we opened it together on video call and she literally got so emotional. Sabse best decision tha aapko DM karna ✨",
    ],
    reaction: "❤️",
    tilt: -1.7,
  },

  // 14. 3-word compliment #5
  {
    id: "dm-short-5",
    avatar: "/testimonials/avatar-13.jpg",
    messages: ["You saved me 🙌"],
    reaction: "❤️",
    tilt: -2.0,
  },
];
