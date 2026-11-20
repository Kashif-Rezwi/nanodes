"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@mantine/core";
import {
  mountDisplay,
  prepareFrames,
  prepareImageFrames,
  prepareTextFrame,
  type DisplayController,
  type GlyphFrame,
} from "nanodes";
import { shapes } from "@/lib/content";

export type Mode = "text" | "svg" | "composed";
interface Props {
  mode?: Mode;
  text?: string;
  shape?: string;
  autoplay?: boolean;
  transition?: "shimmer" | "none";
  hero?: boolean;
}

function content(mode: Mode, text: string, shape: string): GlyphFrame[] {
  const selected =
    shape === "all" ? [...shapes] : shapes.filter((item) => item.id === shape);
  if (mode === "composed") return prepareImageFrames(selected);
  if (mode === "svg")
    return prepareFrames(
      selected.map((item) => ({
        label: item.name,
        color: item.color,
        nodes: [{ type: "svg", path: item.svg }],
      })),
      { columns: 38 },
    );
  return prepareFrames(
    [text, "CREATE", "NANODES"].map((label) => ({
      label,
      color: "#a8c2ff",
      nodes: [{ type: "text", text: label, align: "center", wrap: true }],
    })),
    { columns: 52 },
  );
}

export function GlyphDisplay({
  mode = "composed",
  text = "HELLO WORLD",
  shape = "all",
  autoplay = false,
  transition = "shimmer",
  hero = false,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const instance = useRef<DisplayController | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let display: DisplayController;
    try {
      const frames = content(mode, text, shape);
      display = mountDisplay(element, frames, {
        variant: mode === "text" ? "text" : "image",
        autoplay,
        transition,
        advanceOnClick: !hero,
      });
      instance.current = display;
      setReady(true);
      setError("");
    } catch {
      setError("This preview needs a modern browser with Canvas support.");
      return;
    }
    // This landing page pauses decorative cycling when the specimen is offscreen.
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) display.pause();
      else if (autoplay) display.play();
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      display.destroy();
      instance.current = null;
    };
  }, [mode, text, shape, autoplay, transition, hero]);

  const count = mode === "text" || shape === "all" ? 3 : 1;
  return (
    <div className={`glyph-renderer ${hero ? "glyph-hero" : ""}`}>
      <div
        className="glyph-surface"
        role={hero ? "button" : undefined}
        tabIndex={hero ? 0 : undefined}
        aria-label={hero ? "Show next Nanodes shape" : undefined}
        onClick={hero ? () => instance.current?.next() : undefined}
        onKeyDown={
          hero
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  if (!event.repeat) instance.current?.next();
                }
              }
            : undefined
        }
      >
        <div ref={host} className="glyph-host" />
        {!ready && !error && (
          <pre className="glyph-fallback" aria-hidden="true">
            {prepareTextFrame("NANODES", { columns: 30, align: "center" })}
          </pre>
        )}
        {error && (
          <p className="preview-error" role="status">
            {error}
          </p>
        )}
        {!hero && (
          <div className="glyph-controls">
            {count > 1 && (
              <Button
                className="glyph-next"
                variant="subtle"
                size="sm"
                type="button"
                onClick={() => instance.current?.next()}
                disabled={!ready}
                aria-label="Show next playground item"
                rightSection={
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14m-5-5 5 5-5 5" />
                  </svg>
                }
              >
                Next
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
