"use client";

import type { ComponentType } from "react";
import type { SceneProps } from "./scene-kit";
import { CakeScene, DandelionScene, MeterScene } from "./scenes/feelings";
import { AwardScene, BouquetScene, MapScene, MatchScene, QuestionScene, QuizScene, RingboxScene, StarsScene } from "./scenes/games";
import { KnockScene, LightsScene, ScratchScene, SealScene, UnwrapScene } from "./scenes/openers";
import { asPage, CountdownSection, GallerySection, HeroSection, NoticedSection, PlaylistSection } from "./scenes/site";
import { ComplimentsScene, SpotlightScene } from "./scenes/personal";
import { CouponScene, DeckScene, JarScene, PolaroidsScene, ReceiptScene } from "./scenes/paper";
import { FinaleScene, LetterScene, NumbersScene, VoiceScene, WishesScene } from "./scenes/reading";
import type { SceneType } from "./types";

// Each scene type renders with its own config; the map keeps the player generic.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SCENES: Record<SceneType, ComponentType<SceneProps<any>>> = {
  seal: SealScene,
  scratch: ScratchScene,
  lights: LightsScene,
  knock: KnockScene,
  unwrap: UnwrapScene,
  spotlight: SpotlightScene,
  compliments: ComplimentsScene,
  dandelion: DandelionScene,
  cake: CakeScene,
  meter: MeterScene,
  receipt: ReceiptScene,
  deck: DeckScene,
  coupon: CouponScene,
  jar: JarScene,
  polaroids: PolaroidsScene,
  quiz: QuizScene,
  match: MatchScene,
  stars: StarsScene,
  question: QuestionScene,
  ringbox: RingboxScene,
  bouquet: BouquetScene,
  award: AwardScene,
  map: MapScene,
  letter: LetterScene,
  numbers: NumbersScene,
  wishes: WishesScene,
  voice: VoiceScene,
  finale: FinaleScene,
  hero: asPage(HeroSection, true),
  countdown: asPage(CountdownSection),
  noticed: asPage(NoticedSection),
  gallery: asPage(GallerySection),
  playlist: asPage(PlaylistSection),
};

