"use client";

import { Link2, Music2, Pause, Play, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Field, TextInput } from "@/components/editor/fields";
import type { Track } from "@/components/story/types";
import {
  extractYouTubeId,
  getTrackPlayable,
  hasTrack,
  isDirectAudioUrl,
  playTrackAudio,
  type Stopper,
} from "@/components/story/gift-music";
import { cn } from "@/lib/utils";
import { audioToDataUrl } from "./draft-store";

export function TrackField({
  value,
  onChange,
  roomy,
  highlight,
  label = "Song",
}: {
  value?: Track;
  onChange: (next: Track | undefined) => void;
  roomy?: boolean;
  highlight?: boolean;
  label?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ title?: string; thumbnail?: string; loading?: boolean }>({});
  const [testing, setTesting] = useState(false);
  const testStopper = useRef<Stopper | null>(null);
  const track = value ?? {};

  // Stop test audio on unmount
  useEffect(() => () => {
    testStopper.current?.stop();
    testStopper.current = null;
  }, []);

  // When track link changes, fetch title and thumbnail
  useEffect(() => {
    const link = track.link?.trim();
    if (!link) {
      setMeta({});
      return;
    }
    const ytId = extractYouTubeId(link);
    const isDirect = isDirectAudioUrl(link);
    if (!ytId && !isDirect) {
      setMeta({});
      return;
    }

    let active = true;
    setMeta((m) => ({ ...m, loading: true }));

    fetch(`/api/audio-info?url=${encodeURIComponent(link)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setMeta({
          title: data.title,
          thumbnail: data.thumbnail,
          loading: false,
        });
        if (data.title && (!track.title || track.title !== data.title)) {
          patch({
            ...track,
            title: data.title,
            youtubeId: data.youtubeId || ytId || undefined,
          });
        }
      })
      .catch(() => {
        if (!active) return;
        setMeta({ loading: false });
      });

    return () => {
      active = false;
    };
  }, [track.link]);

  function patch(next: Track) {
    const clean: Track = {
      link: next.link?.trim() || undefined,
      file: next.file,
      fileName: next.file ? next.fileName : undefined,
      title: next.title,
      youtubeId: next.youtubeId || extractYouTubeId(next.link) || undefined,
    };
    onChange(hasTrack(clean) ? clean : undefined);
  }

  function toggleTest() {
    if (testing) {
      testStopper.current?.stop();
      testStopper.current = null;
      setTesting(false);
      return;
    }
    const stopper = playTrackAudio(track, {
      loop: false,
      onEnd: () => setTesting(false),
      onStop: () => setTesting(false),
    });
    if (stopper) {
      testStopper.current = stopper;
      setTesting(true);
    }
  }

  const isYt = !!extractYouTubeId(track.link);
  const isDirect = !!track.link && isDirectAudioUrl(track.link);
  const canPlay = !!getTrackPlayable(track);

  return (
    <div className="space-y-4">
      <Field
        label={`${label} link`}
        hint="YouTube, YouTube Shorts, YouTube Music, or a direct audio URL."
        roomy={roomy}
        highlight={highlight}
      >
        <span className="relative block">
          <Link2 className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <TextInput
            type="text"
            inputMode="url"
            placeholder="https://youtube.com/watch?v=..."
            value={track.link ?? ""}
            onChange={(e) => {
              const newLink = e.target.value;
              const ytId = extractYouTubeId(newLink);
              patch({
                ...track,
                link: newLink,
                youtubeId: ytId || undefined,
              });
            }}
            className={cn("pl-10", roomy && "min-h-12 text-base")}
          />
        </span>

        {/* Link Audio Status Card */}
        {track.link && (isYt || isDirect) && (
          <div className="mt-2.5 flex items-center gap-3 rounded-2xl border border-line/80 bg-paper p-3 shadow-xs">
            {meta.thumbnail ? (
              <img src={meta.thumbnail} alt="" className="size-11 rounded-xl object-cover shrink-0 shadow-xs" />
            ) : (
              <div className="grid size-11 place-items-center rounded-xl bg-rose-pale text-rose-deep shrink-0">
                <Music2 className="size-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-ink">
                {meta.title || track.title || (isYt ? "YouTube Audio" : "Direct Audio Stream")}
              </p>
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Plays inside gift in background
              </p>
            </div>
            {canPlay && (
              <button
                type="button"
                onClick={toggleTest}
                className="btn btn-ink flex items-center gap-1.5 px-3 py-1.5 text-xs shrink-0"
              >
                {testing ? <Pause className="size-3.5 fill-current" /> : <Play className="size-3.5 fill-current ml-0.5" />}
                {testing ? "Stop" : "Test audio"}
              </button>
            )}
          </div>
        )}
      </Field>

      <div>
        <p className={cn(roomy ? "type-heading text-base font-semibold text-ink" : "type-label text-muted", highlight && "text-rose-deep")}>
          Or upload a file
        </p>
        <div className="mt-2 flex items-center gap-3">
          <label className={cn("btn btn-paper inline-flex items-center gap-2 px-4", roomy ? "h-12 text-sm" : "h-10 text-sm")}>
            <Upload className="size-4" />
            {track.file ? "Replace file" : "Choose audio"}
            <input
              type="file"
              accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg,.opus,.flac"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setError(null);
                try {
                  patch({ ...track, file: await audioToDataUrl(file), fileName: file.name });
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Couldn't add that song.");
                }
              }}
            />
          </label>
          {track.file && (
            <span className="min-w-0 flex-1 truncate text-sm text-muted">{track.fileName || "Audio file"}</span>
          )}
          {track.file && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                if (testing) {
                  testStopper.current?.stop();
                  testStopper.current = null;
                  setTesting(false);
                }
                patch({ ...track, file: undefined, fileName: undefined });
              }}
              className="flex items-center gap-1 text-sm text-rose-deep"
            >
              <X className="size-3.5" /> Remove
            </button>
          )}
        </div>

        {/* Uploaded Audio Card */}
        {track.file && !track.link && (
          <div className="mt-2.5 flex items-center gap-3 rounded-2xl border border-line/80 bg-paper p-3 shadow-xs">
            <div className="grid size-11 place-items-center rounded-xl bg-cream text-ink shrink-0">
              <Music2 className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-ink">
                {track.fileName || "Uploaded Audio"}
              </p>
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Plays directly inside gift
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTest}
              className="btn btn-ink flex items-center gap-1.5 px-3 py-1.5 text-xs shrink-0"
            >
              {testing ? <Pause className="size-3.5 fill-current" /> : <Play className="size-3.5 fill-current ml-0.5" />}
              {testing ? "Stop" : "Test audio"}
            </button>
          </div>
        )}

        <p className={roomy ? "mt-2 text-sm leading-snug text-muted" : "mt-1.5 text-xs text-muted"}>
          Music plays seamlessly inside your gift without leaving the page. Paste any YouTube or direct audio link, or upload an audio file (under 4 MB).
        </p>
        {error && <p className="mt-2 text-sm text-rose-deep">{error}</p>}
      </div>
    </div>
  );
}
