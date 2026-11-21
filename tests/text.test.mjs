import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareFrames, prepareTextFrame } from '../dist/index.js';

test('text produces the expected block glyphs without browser globals', () => {
  assert.equal(typeof globalThis.document, 'undefined');
  assert.deepEqual(prepareTextFrame('ab', { columns: 7 }).split('\n'), [
    '       ',
    '█▀█ █▄▄',
    '█▀█ █▄█',
  ]);
  assert.deepEqual(prepareTextFrame('A').split('\n').map(row => row.length), [76, 76, 76]);
});

test('text nodes stack and sequences share a rectangular grid', () => {
  const frames = prepareFrames([
    {
      label: 'A then B',
      color: '#123456',
      nodes: [{ type: 'text', text: 'A' }, { type: 'text', text: 'B', align: 'right' }],
    },
    { label: 'C', nodes: [{ type: 'text', text: 'C' }] },
  ], { columns: 7, gap: 1 });
  assert.deepEqual(frames, [
    {
      label: 'A then B', color: '#123456',
      ascii: ['█▀█    ', '█▀█    ', '       ', '    █▄▄', '    █▄█'].join('\n'),
    },
    {
      label: 'C', color: '#a9c8ff',
      ascii: ['█▀▀    ', '█▄▄    ', '       ', '       ', '       '].join('\n'),
    },
  ]);
});
