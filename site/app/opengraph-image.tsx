import { ImageResponse } from "next/og";
import { BrandWordmark } from "@/components/brand";
export const dynamic = "force-static";
export const alt = "Nanodes — Small glyphs. Big personality.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#1b1f29",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 90,
        color: "#f3f3f6",
      }}
    >
      <div
        style={{
          color: "#c5baff",
          fontSize: 34,
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 40,
        }}
      >
        <BrandWordmark />
      </div>
      <div style={{ fontSize: 88, letterSpacing: -5, display: "flex" }}>
        Small glyphs.
      </div>
      <div
        style={{
          fontSize: 88,
          letterSpacing: -5,
          color: "#a8c2ff",
          display: "flex",
        }}
      >
        Big personality.
      </div>
      <div
        style={{
          color: "#a4a7b3",
          marginTop: 38,
          fontSize: 26,
          display: "flex",
        }}
      >
        Text. SVGs. Zero runtime dependencies.
      </div>
    </div>,
    size,
  );
}
