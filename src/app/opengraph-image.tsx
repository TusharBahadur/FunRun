import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name}: ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default share card for every page that doesn't make its own. */
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 88, background: "#f5efe6", color: "#1b1215" }}>
        <div style={{ fontSize: 132, lineHeight: 1 }}>{siteConfig.name}</div>
        <div style={{ marginTop: 24, fontSize: 64, color: "#e23b54" }}>{siteConfig.tagline}</div>
        <div style={{ marginTop: 40, fontSize: 34, maxWidth: 900, lineHeight: 1.3, opacity: 0.75 }}>{siteConfig.description}</div>
      </div>
    ),
    size,
  );
}
