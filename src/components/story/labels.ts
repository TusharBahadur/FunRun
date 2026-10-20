import { passiveScenes, type Scene, type SceneType } from "./types";

/** How each scene is described to a buyer, in the order it plays. */
export const sceneLabels: Record<SceneType, string> = {
  seal: "Press and hold to break the wax seal",
  scratch: "Scratch a card to reveal the message",
  lights: "Light the candles in a dark room",
  knock: "Knock on the door",
  unwrap: "Tap to unwrap a gift",
  spotlight: "Their photo, covered in notes about them",
  compliments: "Pop bubbles to find compliments",
  hero: "A full-screen photo with your title",
  countdown: "A live countdown to your date",
  noticed: "A few things you’ve noticed about them",
  gallery: "A gallery of your photos",
  playlist: "A playlist of your songs",
  dandelion: "Hold to make a wish on a dandelion",
  cake: "Blow out the candles, one by one",
  meter: "Tap to fill the meter past 100%",
  receipt: "Print a receipt, line by line",
  deck: "Swipe through a deck of reasons",
  coupon: "Tear off a coupon",
  jar: "Shake a jar of notes",
  polaroids: "Shake photos until they develop",
  quiz: "A little quiz with cheeky answers",
  match: "A memory-match game",
  stars: "Connect the stars into a heart",
  question: "A question where “No” runs away",
  ringbox: "Open the ring box",
  bouquet: "Build a bouquet, flower by flower",
  award: "Polish a trophy to reveal the engraving",
  map: "Walk a map of your places",
  letter: "Your letter",
  numbers: "Their life, by the numbers",
  wishes: "Friends’ and family’s wishes",
  voice: "A voice note from you",
  finale: "The finale",
};

export function storyFacts(scenes: Scene[]) {
  const finale = scenes.find((s) => s.type === "finale");
  return {
    pages: scenes.length,
    games: scenes.filter((s) => !passiveScenes.includes(s.type)).length,
    wishes: scenes.some((s) => s.type === "wishes"),
    voice: scenes.some((s) => s.type === "voice"),
    letter: scenes.some((s) => s.type === "letter"),
    numbers: scenes.some((s) => s.type === "numbers"),
    thankYou: finale?.type === "finale" && !!finale.thankYou,
    keepsake: finale?.type === "finale" && !!finale.keepsake,
  };
}
