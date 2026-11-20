"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@mantine/core";

export function CopyButton({
  value,
  label = "Copy code",
}: {
  value: string;
  label?: string;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    timer.current = setTimeout(() => setStatus("idle"), 2400);
  }
  const text =
    status === "copied"
      ? "Copied"
      : status === "error"
        ? "Select code"
        : "Copy";
  return (
    <Button
      className="copy-button"
      variant="subtle"
      size="compact-sm"
      type="button"
      aria-label={status === "idle" ? label : text}
      onClick={copy}
      leftSection={
        <svg
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {status === "copied" ? (
            <path d="m4 10 4 4 8-8" />
          ) : (
            <>
              <rect x="7" y="7" width="10" height="10" rx="2" />
              <path d="M12 4V3H3v9h1" />
            </>
          )}
        </svg>
      }
    >
      <span role="status">{text}</span>
    </Button>
  );
}
