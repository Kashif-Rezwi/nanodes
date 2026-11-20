"use client";

import { useEffect, useRef, useState } from "react";
import { ActionIcon, Button } from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
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

const fallback = prepareTextFrame("NANODES", { columns: 30, align: "center" });

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
  const visible = useRef(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const playing = autoplay && !paused;
  const playback = useRef({ playing, transition });

  useEffect(() => {
    playback.current.playing = playing;
    if (playing && visible.current) instance.current?.play();
    else instance.current?.pause();
  }, [playing]);

  useEffect(() => {
    playback.current.transition = transition;
    instance.current?.setTransition(transition);
  }, [transition]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let display: DisplayController;
    try {
      display = mountDisplay(element, content(mode, text, shape), {
        variant: mode === "text" ? "text" : "image",
        autoplay: playback.current.playing,
        transition: playback.current.transition,
        advanceOnClick: !hero,
      });
      instance.current = display;
      setReady(true);
      setError("");
    } catch (error) {
      setReady(false);
      setError(
        error instanceof Error ? error.message : "The preview could not be rendered.",
      );
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
      if (entry.isIntersecting && playback.current.playing) display.play();
      else display.pause();
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      display.destroy();
      instance.current = null;
    };
  }, [mode, text, shape, hero]);

  const count = mode === "text" || shape === "all" ? 3 : 1;
  const pauseLabel = paused ? "Resume shape animation" : "Pause shape animation";
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
          <pre className="glyph-fallback" aria-hidden="true">{fallback}</pre>
        )}
        {error && <p className="preview-error" role="status">{error}</p>}
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
      {hero && autoplay && ready && !reducedMotion && (
        <ActionIcon
          className="glyph-pause"
          variant="subtle"
          size={44}
          radius="xl"
          type="button"
          aria-label={pauseLabel}
          title={pauseLabel}
          onClick={() => setPaused((value) => !value)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d={paused ? "M8 5v14l11-7z" : "M7 5h4v14H7zM14 5h4v14h-4z"}
            />
          </svg>
        </ActionIcon>
      )}
    </div>
  );
}
