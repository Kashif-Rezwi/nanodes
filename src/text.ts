/** Shared portfolio block alphabet. Unsupported characters retain the reference blank fallback. */
const ASCII_COLS = 76;
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

export function renderTextRows(word: string): [string, string] {
  const line1: string[] = [];
  const line2: string[] = [];
  for (const ch of word.toUpperCase()) {
    const glyph = miniFont[ch] ?? [' ', ' '];
    line1.push(glyph[0]);
    line2.push(glyph[1]);
  }
  return [line1.join(' '), line2.join(' ')];
}

export function prepareTextFrame(text: string): string {
  const rows = ['', ...renderTextRows(text)];
  for (const row of rows) {
    if (row.length > ASCII_COLS) {
      throw new Error(
        `Glyph text frame too wide (${row.length}ch > ${ASCII_COLS}ch): "${text}"`
      );
    }
  }
  return rows.map((row) => row.padEnd(ASCII_COLS, ' ')).join('\n');
}
