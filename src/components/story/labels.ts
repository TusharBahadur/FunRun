import { passiveScenes, type Scene, type SceneType } from "./types";

/** How each scene is described to a buyer, in the order it plays. */
export const sceneLabels: Record<SceneType, string> = {
  seal: "Press and hold to break the wax seal",
  scratch: "Scratch a card to reveal the message",
  lights: "Light the candles in a dark room",
  knock: "Pick up the call",
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
  award: "A polaroid of the winner",
  map: "Walk a map of your places",
  letter: "Your letter",
  numbers: "Their life, by the numbers",
  wishes: "Friends’ and family’s wishes",
  voice: "A voice note from you",
  finale: "The finale",
};

/** The in-page button that turns to this scene, named for what’s waiting. */
const turnInto: Record<SceneType, string> = {
  seal: "Break the seal",
  scratch: "Scratch the card",
  lights: "Light the candles",
  knock: "Pick up the call",
  unwrap: "Open your gift",
  spotlight: "Look at you",
  compliments: "Pop the compliments",
  hero: "Come in",
  countdown: "See the date",
  noticed: "Things I noticed",
  gallery: "See the photos",
  playlist: "Play our songs",
  dandelion: "Make a wish",
  cake: "Blow out the candles",
  meter: "Fill it up",
  receipt: "Print the receipt",
  deck: "Flip the cards",
  coupon: "Tear this off",
  jar: "Open the jar",
  polaroids: "Develop the photos",
  quiz: "Take the quiz",
  match: "Find the pairs",
  stars: "Connect the stars",
  question: "One question",
  ringbox: "Open the box",
  bouquet: "Build the bouquet",
  award: "See the winner",
  map: "Walk our map",
  letter: "Read my letter",
  numbers: "By the numbers",
  wishes: "Read the wishes",
  voice: "Hear this",
  finale: "One last thing",
};

export function turnLabel(next: Scene, fill: (text: string) => string) {
  return fill(turnInto[next.type]);
}

/** Short gesture pages: after the payoff, turn the page for them. */
export const autoTurn: SceneType[] = ["dandelion", "stars", "match"];

export function storyFacts(scenes: Scene[]) {
  const playable = scenes.filter((s) => s.type !== "finale");
  return {
    pages: playable.length,
    games: playable.filter((s) => !passiveScenes.includes(s.type)).length,
    wishes: playable.some((s) => s.type === "wishes"),
    voice: playable.some((s) => s.type === "voice"),
    letter: playable.some((s) => s.type === "letter"),
    numbers: playable.some((s) => s.type === "numbers"),
  };
}
