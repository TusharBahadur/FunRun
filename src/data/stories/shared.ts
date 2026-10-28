import type { Scene, StoryLevel, StoryPalette, Track } from "@/components/story/types";
import { giftPricing, type OccasionId } from "@/config/site";
import type { Motif, Template } from "@/data/templates";
import { palettes } from "@/data/themes";
import { asset } from "@/lib/assets";

export { palettes };
export type { Track };

/** Every level costs the same; levels only change how much is in the gift. */
export const levelPrice: Record<StoryLevel, number> = {
  little: giftPricing.pricePaise,
  classic: giftPricing.pricePaise,
  grand: giftPricing.pricePaise,
};

/**
 * Curated soothing tracks matched specifically to each occasion.
 * Gentle, heartwarming, romantic, and nostalgic — replaces eerie sounds with soothing melodies.
 */
export const occasionTracks = {
  birthday: {
    goldenHour: {
      title: "golden hour",
      artist: "JVKE",
      link: "https://www.youtube.com/watch?v=PEM0Vs8jf1w",
      youtubeId: "PEM0Vs8jf1w",
    },
    untilIFoundYou: {
      title: "Until I Found You",
      artist: "Stephen Sanchez",
      link: "https://www.youtube.com/watch?v=GxldQ9eX2wo",
      youtubeId: "GxldQ9eX2wo",
    },
    likeMeBetter: {
      title: "I Like Me Better",
      artist: "Lauv",
      link: "https://www.youtube.com/watch?v=BcqxLCWn-CE",
      youtubeId: "BcqxLCWn-CE",
    },
  },
  anniversary: {
    tumSeHi: {
      title: "Tum Se Hi",
      artist: "Mohit Chauhan (Pritam)",
      link: "https://www.youtube.com/watch?v=Cb6wuzOurPc",
      youtubeId: "Cb6wuzOurPc",
    },
    cantHelpFalling: {
      title: "Can't Help Falling in Love",
      artist: "Kina Grannis",
      link: "https://www.youtube.com/watch?v=6-wEAeNcA_A",
      youtubeId: "6-wEAeNcA_A",
    },
    perfect: {
      title: "Perfect",
      artist: "Ed Sheeran",
      link: "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
      youtubeId: "2Vv-BfVoq4g",
    },
  },
  loveLetter: {
    kasoor: {
      title: "Kasoor",
      artist: "Prateek Kuhad",
      link: "https://www.youtube.com/watch?v=BmUe3-sfr7E",
      youtubeId: "BmUe3-sfr7E",
    },
    dandelions: {
      title: "Dandelions",
      artist: "Ruth B.",
      link: "https://www.youtube.com/watch?v=W8a4sUabCUo",
      youtubeId: "W8a4sUabCUo",
    },
    pehlaNasha: {
      title: "Pehla Nasha",
      artist: "Sanam (Acoustic)",
      link: "https://www.youtube.com/watch?v=SBfPs-PMGTA",
      youtubeId: "SBfPs-PMGTA",
    },
    alagAasmaan: {
      title: "Alag Aasmaan",
      artist: "Anuv Jain",
      link: "https://www.youtube.com/watch?v=vA86QFrXoho",
      youtubeId: "vA86QFrXoho",
    },
  },
  apology: {
    baarishein: {
      title: "Baarishein",
      artist: "Anuv Jain",
      link: "https://www.youtube.com/watch?v=RLzC55ai0eo",
      youtubeId: "RLzC55ai0eo",
    },
    chooLo: {
      title: "Choo Lo",
      artist: "The Local Train",
      link: "https://www.youtube.com/watch?v=sFMRqxCexDk",
      youtubeId: "sFMRqxCexDk",
    },
    somewhereOnlyWeKnow: {
      title: "Somewhere Only We Know",
      artist: "Lily Allen",
      link: "https://www.youtube.com/watch?v=mer6X7nOY_o",
      youtubeId: "mer6X7nOY_o",
    },
  },
  friendship: {
    countOnMe: {
      title: "Count on Me",
      artist: "Bruno Mars",
      link: "https://www.youtube.com/watch?v=4JNtAtGGNRU",
      youtubeId: "4JNtAtGGNRU",
    },
    teraYaarHoonMain: {
      title: "Tera Yaar Hoon Main",
      artist: "Arijit Singh",
      link: "https://www.youtube.com/watch?v=EatzcaVJRMs",
      youtubeId: "EatzcaVJRMs",
    },
    photograph: {
      title: "Photograph",
      artist: "Ed Sheeran",
      link: "https://www.youtube.com/watch?v=nSDgHBxUbVQ",
      youtubeId: "nSDgHBxUbVQ",
    },
  },
  family: {
    aashiyan: {
      title: "Aashiyan",
      artist: "Shreya Ghoshal & Nikhil Paul George",
      link: "https://www.youtube.com/watch?v=OuNGySNJjWg",
      youtubeId: "OuNGySNJjWg",
    },
    photograph: {
      title: "Photograph",
      artist: "Ed Sheeran",
      link: "https://www.youtube.com/watch?v=nSDgHBxUbVQ",
      youtubeId: "nSDgHBxUbVQ",
    },
  },
  girlfriendDay: {
    ennaSona: {
      title: "Enna Sona",
      artist: "Arijit Singh & A.R. Rahman",
      link: "https://www.youtube.com/watch?v=mrdRHsIkK_c",
      youtubeId: "mrdRHsIkK_c",
    },
    lover: {
      title: "Lover",
      artist: "Taylor Swift",
      link: "https://www.youtube.com/watch?v=-BjZmE2gtdo",
      youtubeId: "-BjZmE2gtdo",
    },
    dandelions: {
      title: "Dandelions",
      artist: "Ruth B.",
      link: "https://www.youtube.com/watch?v=W8a4sUabCUo",
      youtubeId: "W8a4sUabCUo",
    },
  },
  boyfriendDay: {
    apnaBanaLe: {
      title: "Apna Bana Le",
      artist: "Arijit Singh (Sachin-Jigar)",
      link: "https://www.youtube.com/watch?v=ElZfdU54Cp8",
      youtubeId: "ElZfdU54Cp8",
    },
    yellow: {
      title: "Yellow",
      artist: "Coldplay",
      link: "https://www.youtube.com/watch?v=yKNxeF4KMsY",
      youtubeId: "yKNxeF4KMsY",
    },
    untilIFoundYou: {
      title: "Until I Found You",
      artist: "Stephen Sanchez",
      link: "https://www.youtube.com/watch?v=GxldQ9eX2wo",
      youtubeId: "GxldQ9eX2wo",
    },
  },
};

type StoryTemplateInput = {
  slug: string;
  name: string;
  occasion: OccasionId;
  level: StoryLevel;
  description: string;
  palette: StoryPalette;
  motif: Motif;
  preview: Template["preview"];
  isNew?: boolean;
  tier?: Template["tier"];
  recipient: string;
  sender: string;
  melody: "birthday" | "lullaby" | "waltz" | "sunny";
  track?: Track;
  paper?: boolean;
  scenes: Scene[];
};

/** Turns a story recipe into a gallery template with the right price, colours, and soothing music. */
export function storyTemplate(t: StoryTemplateInput): Template {
  const { palette } = t;
  return {
    slug: t.slug,
    name: t.name,
    occasion: t.occasion,
    description: t.description,
    pricePaise: levelPrice[t.level],
    isNew: t.isNew ?? true,
    palette: { bg: palette.bg, fg: palette.fg, accent: palette.accent },
    experiencePalette: { cream: palette.cream, pink: palette.pink, gold: palette.gold, ink: palette.ink },
    motif: t.motif,
    preview: t.preview,
    experience: "story",
    tier: t.tier,
    level: t.level,
    story: {
      recipient: t.recipient,
      sender: t.sender,
      melody: t.melody,
      track: t.track,
      palette,
      paper: t.paper,
      scenes: t.scenes,
    },
  };
}

/** Demo photos in assets/photos (Unsplash). Senders swap in their own. */
export const demoPhoto = (name: string) => asset(`photos/${name}.jpg`);

type SiteTemplateInput = Omit<StoryTemplateInput, "level" | "tier">;

/** A website-style gift: one long scrolling page with soothing background music. */
export function siteTemplate(t: SiteTemplateInput): Template {
  const { palette } = t;
  return {
    slug: t.slug,
    name: t.name,
    occasion: t.occasion,
    description: t.description,
    pricePaise: giftPricing.pricePaise,
    isNew: t.isNew ?? true,
    palette: { bg: palette.bg, fg: palette.fg, accent: palette.accent },
    experiencePalette: { cream: palette.cream, pink: palette.pink, gold: palette.gold, ink: palette.ink },
    motif: t.motif,
    preview: t.preview,
    experience: "story",
    story: {
      format: "site",
      recipient: t.recipient,
      sender: t.sender,
      melody: t.melody,
      track: t.track,
      palette,
      scenes: t.scenes,
    },
  };
}
