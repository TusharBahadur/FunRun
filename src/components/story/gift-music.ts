"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MusicBox } from "@/components/experiences/music-box";
import { melodies } from "./melodies";
import type { MelodyId, Track } from "./types";

const AUDIO_EXT = /\.(mp3|m4a|aac|wav|ogg|opus|webm|flac|mp4)(\?|#|$)/i;

export function isDirectAudioUrl(url: string) {
  return /^(blob:|data:audio\/)/i.test(url) || AUDIO_EXT.test(url);
}

export function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const str = url.trim();
  const m = str.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i,
  );
  return m ? m[1] : null;
}

export function getTrackPlayable(track?: Track | null):
  | { type: "html5"; src: string }
  | { type: "youtube"; videoId: string }
  | null {
  if (!track) return null;
  if (track.file) return { type: "html5", src: track.file };
  if (track.link) {
    if (isDirectAudioUrl(track.link)) {
      return { type: "html5", src: track.link };
    }
    const ytId = track.youtubeId || extractYouTubeId(track.link);
    if (ytId) {
      return { type: "youtube", videoId: ytId };
    }
  }
  return null;
}

/** Direct playable audio source (HTML5 Audio). */
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

export type Stopper = { stop: () => void };

let active: Stopper | null = null;

export function seize(next: Stopper) {
  if (active && active !== next) active.stop();
  active = next;
}

export function release(handle: Stopper) {
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

/** Plays YouTube audio in the background without redirecting to YouTube. */
export function playYouTubeAudio(
  videoId: string,
  opts?: {
    loop?: boolean;
    onEnd?: () => void;
    onStop?: () => void;
    onError?: () => void;
  },
): Stopper {
  if (typeof document === "undefined") {
    return { stop: () => {} };
  }

  // Remove any previous background YouTube audio player iframe
  const existing = document.getElementById("gift-music-yt-player");
  if (existing) {
    try {
      existing.remove();
    } catch {}
  }

  const iframe = document.createElement("iframe");
  iframe.id = "gift-music-yt-player";
  iframe.style.position = "fixed";
  iframe.style.width = "4px";
  iframe.style.height = "4px";
  iframe.style.left = "-9999px";
  iframe.style.top = "-9999px";
  iframe.style.opacity = "0.01";
  iframe.style.pointerEvents = "none";
  iframe.style.zIndex = "-1";
  iframe.tabIndex = -1;
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("allow", "autoplay; encrypted-media");

  const origin = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "";
  const loopParam = opts?.loop !== false ? `&loop=1&playlist=${videoId}` : "";
  iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&autoplay=1&controls=0&playsinline=1${loopParam}&origin=${encodeURIComponent(origin)}`;

  let unmounted = false;

  const sendCommand = (func: string, args: unknown[] = []) => {
    try {
      iframe.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func, args }),
        "*",
      );
    } catch {}
  };

  const onMessage = (e: MessageEvent) => {
    if (typeof e.data !== "string") return;
    try {
      const data = JSON.parse(e.data);
      if (data.event === "onReady") {
        sendCommand("unMute");
        sendCommand("setVolume", [100]);
        sendCommand("playVideo");
      } else if (data.event === "onStateChange") {
        if (data.info === 0 && opts?.loop === false) {
          handle.stop();
          opts?.onEnd?.();
        }
      } else if (data.event === "onError") {
        handle.stop();
        opts?.onError?.();
      }
    } catch {}
  };

  window.addEventListener("message", onMessage);

  iframe.onload = () => {
    if (unmounted) return;
    try {
      iframe.contentWindow?.postMessage(
        JSON.stringify({ event: "listening" }),
        "*",
      );
    } catch {}
    setTimeout(() => {
      if (!unmounted) {
        sendCommand("unMute");
        sendCommand("setVolume", [100]);
        sendCommand("playVideo");
      }
    }, 150);
    setTimeout(() => {
      if (!unmounted) {
        sendCommand("unMute");
        sendCommand("playVideo");
      }
    }, 450);
  };

  document.body.appendChild(iframe);

  const handle: Stopper = {
    stop() {
      if (unmounted) return;
      unmounted = true;
      try {
        sendCommand("pauseVideo");
        sendCommand("stopVideo");
      } catch {}
      window.removeEventListener("message", onMessage);
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
      release(handle);
      opts?.onStop?.();
    },
  };

  seize(handle);
  return handle;
}

/** Plays whatever playable source is associated with the track: file, direct URL, or YouTube. */
export function playTrackAudio(
  track?: Track | null,
  opts?: {
    loop?: boolean;
    onEnd?: () => void;
    onStop?: () => void;
    onError?: () => void;
  },
): Stopper | null {
  const playable = getTrackPlayable(track);
  if (playable?.type === "html5") {
    return playHtmlAudio(playable.src, {
      loop: opts?.loop,
      onEnd: opts?.onEnd,
      onStop: opts?.onStop,
    });
  }
  if (playable?.type === "youtube") {
    return playYouTubeAudio(playable.videoId, {
      loop: opts?.loop,
      onEnd: opts?.onEnd,
      onStop: opts?.onStop,
      onError: opts?.onError,
    });
  }
  return null;
}

/** Background music for a gift: their file, a YouTube link, a direct audio link, or the music-box melody. */
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
    (_opts?: { openLink?: boolean }) => {
      stop();
      const playable = getTrackPlayable(story.track);

      if (playable?.type === "html5") {
        current.current = playHtmlAudio(playable.src, {
          loop: true,
          onEnd: () => setPlaying(false),
          onStop: () => setPlaying(false),
        });
        setPlaying(true);
        return;
      }

      if (playable?.type === "youtube") {
        current.current = playYouTubeAudio(playable.videoId, {
          loop: true,
          onEnd: () => setPlaying(false),
          onStop: () => setPlaying(false),
          onError: () => {
            // Fallback gracefully to music box melody if YouTube fails
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
        });
        setPlaying(true);
        return;
      }

      // Fallback: music-box melody
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
