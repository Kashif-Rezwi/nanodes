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
