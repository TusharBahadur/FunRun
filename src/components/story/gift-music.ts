"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MusicBox } from "@/components/experiences/music-box";
import { melodies } from "./melodies";
import type { MelodyId, Track } from "./types";

const AUDIO_EXT = /\.(mp3|m4a|aac|wav|ogg|opus|webm|flac)(\?|#|$)/i;

export function isDirectAudioUrl(url: string) {
  return /^(blob:|data:audio\/)/i.test(url) || AUDIO_EXT.test(url);
}

/** Source we can play inside the gift. Streaming links are opened separately. */
export function trackSrc(track?: Track | null) {
  if (track?.file) return track.file;
  if (track?.link && isDirectAudioUrl(track.link)) return track.link;
  return null;
}

export function trackHref(track?: Track | null, fallbackTitle?: string) {
  if (track?.link) return track.link;
  if (fallbackTitle) return `https://www.youtube.com/results?search_query=${encodeURIComponent(fallbackTitle)}`;
  return null;
}

export function hasTrack(track?: Track | null) {
  return !!(track?.link || track?.file);
}

type Stopper = { stop: () => void };

let active: Stopper | null = null;

function seize(next: Stopper) {
  if (active && active !== next) active.stop();
  active = next;
}

function release(handle: Stopper) {
  if (active === handle) active = null;
}

/** Plays one audio file. Stops whatever else was playing in the gift. */
export function playHtmlAudio(
  src: string,
  { loop = false, onEnd, onStop }: { loop?: boolean; onEnd?: () => void; onStop?: () => void } = {},
): Stopper {
  const el = new Audio(src);
  el.loop = loop;
  const handle: Stopper = {
    stop() {
      el.pause();
      el.removeAttribute("src");
      el.load();
      release(handle);
      onStop?.();
    },
  };
  seize(handle);
  el.onended = () => {
    if (!loop) {
      release(handle);
      onEnd?.();
    }
  };
  void el.play().catch(() => {
    handle.stop();
    onEnd?.();
  });
  return handle;
}

/** Background music for a gift: their file, a direct audio link, or the music-box melody. */
export function useGiftMusic(story: { melody: MelodyId; track?: Track }) {
  const box = useRef<MusicBox | null>(null);
  const current = useRef<Stopper | null>(null);
  const [playing, setPlaying] = useState(false);

  const stop = useCallback(() => {
    box.current?.stop();
    current.current?.stop();
    current.current = null;
    setPlaying(false);
  }, []);

  const play = useCallback(
    (opts?: { openLink?: boolean }) => {
      const src = trackSrc(story.track);
      stop();
      if (src) {
        current.current = playHtmlAudio(src, {
          loop: true,
          onEnd: () => setPlaying(false),
          onStop: () => setPlaying(false),
        });
        setPlaying(true);
        return;
      }
      if (opts?.openLink && story.track?.link) {
        window.open(story.track.link, "_blank", "noopener,noreferrer");
        return;
      }
      box.current ??= new MusicBox();
      const handle: Stopper = {
        stop() {
          box.current?.stop();
          release(handle);
          setPlaying(false);
        },
      };
      seize(handle);
      current.current = handle;
      box.current.play(() => {
        release(handle);
        setPlaying(false);
      }, melodies[story.melody]);
      setPlaying(true);
    },
    [story.melody, story.track, stop],
  );

  useEffect(() => () => stop(), [stop]);

  return { playing, play, stop };
}
