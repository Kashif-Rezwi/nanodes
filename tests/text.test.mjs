import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareTextFrame } from '../dist/index.js';

test('text is usable without browser globals and matches the reference alphabet', () => {
  assert.equal(typeof globalThis.document, 'undefined');
  const rows = prepareTextFrame('full stack engineer').split('\n');
  assert.deepEqual(rows.map(row => row.length), [76, 76, 76]);
  assert.equal(rows[0], ' '.repeat(76));
  assert.equal(rows[1].trimEnd(), '█▀▀ █ █ █   █      █▀▀ ▀█▀ █▀█ █▀▀ █▄▀    █▀▀ █▄ █ █▀▀ █ █▄ █ █▀▀ █▀▀ █▀█');
});

test('text preserves the uppercase and unsupported-character fallback', () => {
  assert.equal(prepareTextFrame('a-z/9.'), prepareTextFrame('A-Z/9.'));
  assert.equal(prepareTextFrame('?'), prepareTextFrame(' '));
});

test('oversized text fails instead of clipping silently', () => {
  assert.throws(() => prepareTextFrame('W'.repeat(20)), /Glyph text frame too wide/);
});
