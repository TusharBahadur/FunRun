import { anniversaryStories } from "./anniversary";
import { apologyStories } from "./apology";
import { birthdayStories } from "./birthday";
import { fathersDayStories } from "./fathers-day";
import { girlfriendDayStories } from "./girlfriend-day";
import { loveLetterStories } from "./love-letter";
import { mothersDayStories } from "./mothers-day";
import { proposalStories } from "./proposal";
import { birthdayPage, fanPage, justForYou, ourCorner } from "./sites";

/** The playable templates: three game stories per occasion (₹99 / ₹149 / ₹179), plus website-style gifts. */
export const storyTemplates = [
  ...birthdayStories,
  birthdayPage,
  ...anniversaryStories,
  ourCorner,
  ...loveLetterStories,
  justForYou,
  ...proposalStories,
  ...apologyStories,
  ...girlfriendDayStories,
  fanPage,
  ...mothersDayStories,
  ...fathersDayStories,
];
