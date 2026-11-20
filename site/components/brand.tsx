"use client";

import { useEffect, useRef, useState } from "react";
import { mountDisplay, prepareFrames, type DisplayController } from "nanodes";
import { shapes } from "@/lib/content";

const brandShape = shapes[2];
const wordmark = prepareFrames(
  [
    {
      label: "Nanodes",
      color: brandShape.color,
      nodes: [{ type: "text", text: "NANODES" }],
    },
  ],
  { columns: 29 },
);

export function Brand() {
  const textHost = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!textHost.current) return;
    let display: DisplayController;
    try {
      display = mountDisplay(textHost.current, wordmark, {
        variant: "text",
        autoplay: false,
        advanceOnClick: false,
      });
      setReady(true);
    } catch {
      return;
    }
    return () => display.destroy();
  }, []);

  return (
    <a className="brand" href="#top" aria-label="Nanodes home">
      <div className="brand-wordmark" aria-hidden="true">
        <div ref={textHost} />
        {!ready && (
          <pre className="brand-wordmark-fallback">{wordmark[0].ascii}</pre>
        )}
      </div>
    </a>
  );
}
