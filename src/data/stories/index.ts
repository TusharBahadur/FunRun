import { anniversaryStories } from "./anniversary";
import { apologyStories } from "./apology";
import { bestFriendsStories } from "./best-friends";
import { birthdayStories } from "./birthday";
import { boyfriendDayStories } from "./boyfriend-day";
import { familyStories } from "./family";
import { friendshipStories } from "./friendship";
import { girlfriendDayStories } from "./girlfriend-day";
import { loveLetterStories } from "./love-letter";
import { birthdayPage, fanPage, hisPage, justForYou, ourCorner } from "./sites";

/** The playable templates: game stories per occasion (usually ₹99 / ₹149 / ₹179), plus website-style gifts. */
export const storyTemplates = [
  ...birthdayStories,
  birthdayPage,
  ...anniversaryStories,
  ourCorner,
  ...loveLetterStories,
  justForYou,
  ...apologyStories,
  ...girlfriendDayStories,
  fanPage,
  ...boyfriendDayStories,
  hisPage,
  ...friendshipStories,
  ...bestFriendsStories,
  ...familyStories,
];
