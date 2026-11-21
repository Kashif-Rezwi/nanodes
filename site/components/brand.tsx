import { prepareFrames } from "nanodes";

const wordmark = prepareFrames(
  [{ label: "Nanodes", nodes: [{ type: "text", text: "NANODES" }] }],
  { columns: 29 },
)[0].ascii;

export function Brand() {
  return (
    <a className="brand" href="#top" aria-label="Nanodes home">
      <div className="brand-wordmark nanodes-text" aria-hidden="true">
        <pre className="nanodes-text-art">{wordmark}</pre>
      </div>
    </a>
  );
}

// The same glyph rows as the live wordmark, rendered as vectors for social cards.
export function BrandWordmark() {
  return (
    <svg
      width="348"
      height="42"
      viewBox="0 0 232 28"
      fill="#c5baff"
      aria-hidden="true"
    >
      {wordmark.split("\n").flatMap((row, y) =>
        [...row].map((glyph, x) =>
          glyph === " " ? null : (
            <rect
              key={`${x}-${y}`}
              x={x * 8}
              y={y * 14 + (glyph === "▄" ? 7 : 0)}
              width="8"
              height={glyph === "█" ? 14 : 7}
            />
          ),
        ),
      )}
    </svg>
  );
}
