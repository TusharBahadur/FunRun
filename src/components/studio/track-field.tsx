"use client";

import { Link2, Upload, X } from "lucide-react";
import { useState } from "react";
import { Field, TextInput } from "@/components/editor/fields";
import type { Track } from "@/components/story/types";
import { hasTrack } from "@/components/story/gift-music";
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
  const track = value ?? {};

  function patch(next: Track) {
    const clean: Track = {
      link: next.link?.trim() || undefined,
      file: next.file,
      fileName: next.file ? next.fileName : undefined,
    };
    onChange(hasTrack(clean) ? clean : undefined);
  }

  return (
    <div className="space-y-4">
      <Field
        label={`${label} link`}
        hint="YouTube, Spotify, Apple Music, or a direct audio URL."
        roomy={roomy}
        highlight={highlight}
      >
        <span className="relative block">
          <Link2 className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <TextInput
            type="text"
            inputMode="url"
            placeholder="https://"
            value={track.link ?? ""}
            onChange={(e) => patch({ ...track, link: e.target.value })}
            className={cn("pl-10", roomy && "min-h-12 text-base")}
          />
        </span>
      </Field>

      <div>
        <p className={cn(roomy ? "text-base font-medium" : "type-label text-muted", highlight && "text-rose-deep")}>
          Or upload a file
        </p>
        <div className="mt-2 flex items-center gap-3">
          <label className={cn("inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-paper px-4 font-medium", roomy ? "h-12 text-sm" : "h-10 text-sm")}>
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
                patch({ ...track, file: undefined, fileName: undefined });
              }}
              className="flex items-center gap-1 text-sm text-rose-deep"
            >
              <X className="size-3.5" /> Remove
            </button>
          )}
        </div>
        <p className={roomy ? "mt-2 text-sm leading-snug text-muted" : "mt-1.5 text-xs text-muted"}>
          A file plays inside the gift. A link opens when they tap play. Keep files under 4 MB.
        </p>
        {error && <p className="mt-2 text-sm text-rose-deep">{error}</p>}
      </div>
    </div>
  );
}
