import { anniversaryStories } from "./anniversary";
import { apologyStories } from "./apology";
import { birthdayStories } from "./birthday";
import { fathersDayStories } from "./fathers-day";
import { girlfriendDayStories } from "./girlfriend-day";
import { loveLetterStories } from "./love-letter";
import { mothersDayStories } from "./mothers-day";
import { proposalStories } from "./proposal";

/** The playable story templates: three per occasion, at ₹99, ₹149 and ₹179. */
export const storyTemplates = [
  ...birthdayStories,
  ...anniversaryStories,
  ...loveLetterStories,
  ...proposalStories,
  ...apologyStories,
  ...girlfriendDayStories,
  ...mothersDayStories,
  ...fathersDayStories,
];
