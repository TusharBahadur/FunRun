import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url")?.trim();
    if (!url) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    // Check YouTube
    const ytMatch = url.match(
      /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i,
    );
    if (ytMatch) {
      const youtubeId = ytMatch[1];
      try {
        const oembedRes = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`,
          { next: { revalidate: 3600 } },
        );
        if (oembedRes.ok) {
          const data = (await oembedRes.json()) as {
            title?: string;
            author_name?: string;
            thumbnail_url?: string;
          };
          return NextResponse.json({
            type: "youtube",
            youtubeId,
            title: data.title ?? `YouTube Video (${youtubeId})`,
            author: data.author_name ?? "",
            thumbnail: data.thumbnail_url ?? "",
          });
        }
      } catch {}
      return NextResponse.json({
        type: "youtube",
        youtubeId,
        title: `YouTube Video (${youtubeId})`,
      });
    }

    // Check direct audio/video
    const AUDIO_EXT = /\.(mp3|m4a|aac|wav|ogg|opus|webm|flac|mp4)(\?|#|$)/i;
    if (AUDIO_EXT.test(url) || /^(blob:|data:audio\/)/i.test(url)) {
      const cleanPath = url.split("?")[0].split("#")[0];
      const filename = cleanPath.split("/").pop() || "Audio Stream";
      return NextResponse.json({
        type: "direct",
        title: decodeURIComponent(filename),
      });
    }

    return NextResponse.json({
      type: "generic",
      title: "Audio Link",
    });
  } catch {
    return NextResponse.json({ error: "Failed to resolve audio info" }, { status: 500 });
  }
}
