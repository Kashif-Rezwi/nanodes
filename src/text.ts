import type { TextLayout, TextOptions } from './types.js';
import { checkOptions, choice, integer } from './validation.js';

/** Shared portfolio block alphabet. Unsupported characters retain the reference blank fallback. */
const miniFont: Record<string, [string, string]> = {
  A: ['█▀█', '█▀█'],
  B: ['█▄▄', '█▄█'],
  C: ['█▀▀', '█▄▄'],
  D: ['█▀▄', '█▄▀'],
  E: ['█▀▀', '██▄'],
  F: ['█▀▀', '█▀ '],
  G: ['█▀▀', '█▄█'],
  H: ['█ █', '█▀█'],
  I: ['█', '█'],
  J: ['  █', '█▄█'],
  K: ['█▄▀', '█ █'],
  L: ['█  ', '█▄▄'],
  M: ['█▀▄▀█', '█ ▀ █'],
  N: ['█▄ █', '█ ▀█'],
  O: ['█▀█', '█▄█'],
  P: ['█▀█', '█▀▀'],
  Q: ['█▀█', '▀▀█'],
  R: ['█▀█', '█▀▄'],
  S: ['█▀▀', '▄▄█'],
  T: ['▀█▀', ' █ '],
  U: ['█ █', '█▄█'],
  V: ['█ █', ' ▀ '],
  W: ['█ █ █', '▀▄▀▄▀'],
  X: ['▀▄▀', '█ █'],
  Y: ['█▄█', ' █ '],
  Z: ['▀▀█', '█▄▄'],
  '0': ['█▀█', '█▄█'],
  '1': ['▄█', ' █'],
  '2': ['▀▀█', '█▄▄'],
  '3': ['▀▀█', '▄▄█'],
  '4': ['█ █', '▀▀█'],
  '5': ['█▀▀', '▄▄█'],
  '6': ['█▀▀', '█▄█'],
  '7': ['▀▀█', '  █'],
  '8': ['█▀█', '█▄█'],
  '9': ['█▀█', '▀▀█'],
  '.': [' ', '▄'],
  '-': [' ', '▀'],
  '/': [' ▄', '█ '],
  ' ': ['  ', '  '],
};

/** Raw two-row letters, before line placement and frame padding. */
function renderTextRows(word: string, spacing: number): [string, string] {
  const glyphs = [...word.toUpperCase()].map(ch => miniFont[ch] ?? [' ', ' ']);
  return [glyphs.map(g => g[0]).join(' '.repeat(spacing)), glyphs.map(g => g[1]).join(' '.repeat(spacing))];
}

export function layoutText(text: string, columns: number, options: TextLayout = {}): string[] {
  checkOptions(options);
  if (typeof text !== 'string') throw new TypeError('Text must be a string.');
  const align = choice(options.align ?? 'left', ['left', 'center', 'right'], 'text alignment');
  const spacing = integer(options.letterSpacing ?? 1, 'letterSpacing', 0);
  const gap = integer(options.lineGap ?? 1, 'lineGap', 0);
  const unsupported = choice(options.unsupported ?? 'blank', ['blank', 'error'], 'unsupported glyph policy');
  if (options.wrap !== undefined && typeof options.wrap !== 'boolean') throw new TypeError('wrap must be a boolean.');
  const lines: string[] = [];
  for (const source of text.replace(/\r\n?/g, '\n').toUpperCase().split('\n')) {
    if (unsupported === 'error') {
      for (const ch of source) if (!miniFont[ch]) throw new TypeError(`Unsupported glyph: "${ch}".`);
    }
    let line = '';
    let width = 0;
    for (const ch of source) {
      const glyphWidth = (miniFont[ch] ?? [' ', ' '])[0].length;
      if (width + (line ? spacing : 0) + glyphWidth > columns) {
        if (!options.wrap) throw new RangeError(`Glyph text frame too wide (>${columns}ch).`);
        if (!line || glyphWidth > columns) {
          throw new RangeError(`Glyph "${ch}" does not fit in ${columns} columns.`);
        }
        lines.push(line);
        line = '';
        width = 0;
      }
      width += (line ? spacing : 0) + glyphWidth;
      line += ch;
    }
    lines.push(line);
  }
  const rows: string[] = [];
  for (const [index, line] of lines.entries()) {
    if (index) rows.push(...Array(gap).fill(' '.repeat(columns)));
    for (const row of renderTextRows(line, spacing)) {
      const padding = columns - row.length;
      const left = align === 'right' ? padding : align === 'center' ? Math.floor(padding / 2) : 0;
      rows.push(' '.repeat(left) + row + ' '.repeat(padding - left));
    }
    if (rows.length > 512) throw new RangeError('Text exceeds 512 glyph rows.');
  }
  return rows;
}

/** Preserve the original optical top row and 76-column default. */
export function prepareTextFrame(text: string, options: TextOptions = {}): string {
  checkOptions(options);
  const columns = integer(options.columns ?? 76, 'columns');
  const rows = [' '.repeat(columns), ...layoutText(text, columns, options)];
  const height = integer(options.rows ?? rows.length, 'rows');
  if (rows.length > height) throw new RangeError(`Text needs ${rows.length} rows; received ${height}.`);
  return [...rows, ...Array(height - rows.length).fill(' '.repeat(columns))].join('\n');
}
