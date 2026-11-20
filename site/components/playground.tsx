"use client";

import { useState } from "react";
import {
  Button,
  SegmentedControl,
  Select,
  Switch,
  TextInput,
} from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import { GlyphDisplay, type Mode } from "./glyph-display";
import { shapes } from "@/lib/content";

const modes = [
  { value: "text", label: "Text" },
  { value: "svg", label: "SVG" },
  { value: "composed", label: "SVG + Text" },
];
const shapeOptions = [
  { value: "all", label: "All shapes" },
  ...shapes.map((item) => ({
    value: item.id,
    label:
      item.id === "spark" ? "Spark" : item.id === "orbit" ? "Orbit" : "Blocks",
  })),
];
const transitions = [
  { value: "shimmer", label: "Shimmer" },
  { value: "none", label: "Instant" },
];

const selectProps = {
  checkIconPosition: "right" as const,
  rightSectionPointerEvents: "none" as const,
  rightSection: (
    <svg
      className="demo-chevron"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  classNames: { dropdown: "demo-dropdown", option: "demo-option" },
  comboboxProps: {
    withinPortal: true,
    offset: 8,
    dropdownPadding: 6,
    transitionProps: { transition: "fade" as const, duration: 100 },
  },
};

export function Playground() {
  const [mode, setMode] = useState<Mode>("text");
  const [draft, setDraft] = useState("HELLO WORLD");
  const [text, setText] = useState("HELLO WORLD");
  const [shape, setShape] = useState("all");
  const [transition, setTransition] = useState<"shimmer" | "none">("shimmer");
  const [autoplay, setAutoplay] = useState(false);
  const [error, setError] = useState("");
  const reducedMotion = useReducedMotion();
  const multiple = mode === "text" || shape === "all";
  const playing = autoplay && multiple && !reducedMotion;

  function apply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode !== "text") return;
    if (!draft.trim()) {
      setError("Enter some text.");
      return;
    }
    if (!/^[a-z0-9 .\-/]+$/i.test(draft)) {
      setError("Use A–Z, numbers, spaces, or . - /");
      return;
    }
    setText(draft.trim().toUpperCase());
    setError("");
  }

  return (
    <div className="playground">
      <div className="playground-heading">
        <h2 id="playground-title">Playground</h2>
      </div>
      <div className="playground-layout">
        <div className="playground-main">
          <GlyphDisplay
            mode={mode}
            text={text}
            shape={shape}
            transition={transition}
            autoplay={playing}
          />
        </div>
        <form
          className="playground-form"
          aria-label="Playground controls"
          onSubmit={apply}
        >
          <SegmentedControl
            className="demo-modes"
            withItemsBorders={false}
            role="radiogroup"
            aria-label="Content type"
            value={mode}
            data={modes}
            onChange={(value) => {
              if (value === "text" || value === "svg" || value === "composed")
                setMode(value);
              setError("");
            }}
          />
          {mode === "text" ? (
            <TextInput
              id="demo-text"
              className="demo-control"
              label="Text"
              value={draft}
              maxLength={32}
              onChange={(event) => {
                setDraft(event.currentTarget.value);
                setError("");
              }}
              error={error || undefined}
              autoComplete="off"
              spellCheck={false}
              rightSection={
                <Button
                  className="demo-apply"
                  type="submit"
                  variant="light"
                  size="compact-sm"
                  aria-label="Apply text"
                >
                  Apply
                </Button>
              }
              rightSectionWidth={68}
              rightSectionPointerEvents="auto"
            />
          ) : (
            <Select
              id="demo-shape"
              className="demo-control"
              label="Shape"
              data={shapeOptions}
              value={shape}
              allowDeselect={false}
              onChange={(value) => {
                if (typeof value === "string") setShape(value);
              }}
              {...selectProps}
            />
          )}
          <Select
            id="demo-transition"
            className="demo-control"
            label="Transition"
            data={transitions}
            value={transition}
            allowDeselect={false}
            onChange={(value) => {
              if (value === "shimmer" || value === "none") setTransition(value);
            }}
            {...selectProps}
          />
          <Switch
            id="demo-cycle"
            className="demo-cycle-control"
            label="Autoplay"
            labelPosition="left"
            size="md"
            withThumbIndicator={false}
            thumbIcon={
              playing ? (
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m4 8 2.5 2.5L12 5" />
                </svg>
              ) : undefined
            }
            disabled={!multiple || reducedMotion}
            aria-description={
              !multiple
                ? "Choose all shapes to enable autoplay."
                : reducedMotion
                  ? "Autoplay follows your reduced motion setting."
                  : undefined
            }
            checked={playing}
            onChange={(event) => setAutoplay(event.currentTarget.checked)}
          />
        </form>
      </div>
    </div>
  );
}
