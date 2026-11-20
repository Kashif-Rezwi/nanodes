import { CopyButton } from "./copy-button";

// The examples are static; highlight their strings and comments without a client-side parser.
function highlight(line: string) {
  return line
    .split(/(\/\/.*$|'[^']*'|\b(?:import|from|const)\b)/g)
    .map((part, index) => {
      const kind = part.startsWith("//")
        ? "comment"
        : part.startsWith("'")
          ? "string"
          : /^(import|from|const)$/.test(part)
            ? "keyword"
            : undefined;
      return kind ? (
        <span className={`syntax-${kind}`} key={index}>
          {part}
        </span>
      ) : (
        part
      );
    });
}

export function CodeBlock({
  title,
  code,
  language,
  label,
}: {
  title: string;
  code: string;
  language: "javascript" | "shell";
  label: string;
}) {
  return (
    <div
      className={
        language === "shell" ? "code-window code-window-shell" : "code-window"
      }
    >
      <div className="code-window-top">
        <span className="code-window-title">
          <span className="code-file-type" aria-hidden="true">
            {language === "javascript" ? "JS" : ">_"}
          </span>
          {title}
        </span>
        <CopyButton value={code} label={`Copy ${label.toLowerCase()}`} />
      </div>
      <pre tabIndex={0} aria-label={label}>
        <code>
          {code.split("\n").map((line, index) => (
            <span className="code-line" key={index}>
              {language === "javascript" ? highlight(line) : line || " "}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
