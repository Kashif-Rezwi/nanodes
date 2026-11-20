import { nonempty } from './validation.js';

/** Check SVG path command groups before asking the browser to rasterize them. */
export function validatePath(path: string): void {
  nonempty(path, 'SVG path');
  const counts: Record<string, number> = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7 };
  let cursor = 0;
  let command = '';
  let first = true;
  function skip(allowComma = true) {
    let commas = 0;
    while (cursor < path.length && /[\s,]/.test(path[cursor])) {
      if (path[cursor++] === ',') commas++;
    }
    if (commas > 1 || (commas && (!allowComma || cursor === path.length || /[a-z]/i.test(path[cursor])))) invalid();
  }
  function invalid(): never { throw new TypeError(`Invalid SVG path near character ${cursor}.`); }
  skip(false);
  while (cursor < path.length) {
    let explicit = false;
    if (/[a-z]/i.test(path[cursor])) {
      explicit = true;
      command = path[cursor++].toUpperCase();
      if (first && command !== 'M') invalid();
      first = false;
      if (command === 'Z') { command = ''; skip(false); continue; }
      if (!(command in counts)) invalid();
    } else if (!command) invalid();
    for (let arg = 0; arg < counts[command]; arg++) {
      skip(arg > 0 || !explicit);
      // Arc flags are single digits and may be adjacent in minified SVG paths.
      if (command === 'A' && (arg === 3 || arg === 4)) {
        if (path[cursor] !== '0' && path[cursor] !== '1') invalid();
        cursor++;
      } else {
        const match = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(path.slice(cursor));
        if (!match || !Number.isFinite(Number(match[0]))) invalid();
        if (command === 'A' && arg < 2 && Number(match[0]) < 0) invalid();
        cursor += match[0].length;
      }
    }
    skip();
  }
}
