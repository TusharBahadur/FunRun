import { Leaf, Mic2, Moon, Sparkles, Sun, Waves } from "lucide-react";
import type { PhotoTone } from "./types";

/** Placeholder "photo" looks used in previews until real uploads exist. */
export const TONES: Record<PhotoTone, { from: string; to: string; icon: typeof Sun }> = {
  sun: { from: "#ffcf6e", to: "#ff8a5c", icon: Sun },
  sea: { from: "#8fd3e8", to: "#3a7bd5", icon: Waves },
  night: { from: "#3b2a5c", to: "#120d24", icon: Moon },
  rose: { from: "#ffb3c1", to: "#e8344e", icon: Mic2 },
  leaf: { from: "#b8e0a0", to: "#3f8f5a", icon: Leaf },
  dusk: { from: "#f7b2d9", to: "#7a4bd1", icon: Sparkles },
};
