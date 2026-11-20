import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareTextFrame, prepareFrames, mountDisplay } from '../dist/index.js';
import { validatePath } from '../dist/path.js';

const scene = text => ({ label: text || 'Blank', nodes: [{ type: 'text', text }] });
const frame = { label: 'A', color: '#fff', ascii: 'A' };

test('multiline text retains explicit breaks, alignment, and glyph spacing', () => {
  const rows = prepareTextFrame('A\nB', { columns: 3 }).split('\n');
  assert.deepEqual(rows, ['   ', '█▀█', '█▀█', '   ', '█▄▄', '█▄█']);
  assert.equal(prepareTextFrame('A', { columns: 8, align: 'center' }).split('\n')[1], '  █▀█   ');
  assert.equal(prepareTextFrame('A', { columns: 8, align: 'right' }).split('\n')[1], '     █▀█');
  assert.equal(prepareTextFrame('AI', { columns: 4, letterSpacing: 0 }).split('\n')[1], '█▀██');
  assert.equal(prepareTextFrame('A\nB', { lineGap: 0 }).split('\n').length, 5);
});

test('wrapping uses whole glyphs and preserves explicit blank lines', () => {
  assert.equal(prepareTextFrame('AB', { columns: 3, wrap: true }), prepareTextFrame('A\nB', { columns: 3 }));
  assert.equal(prepareTextFrame('AB', { columns: 7 }).split('\n').length, 3);
  assert.throws(() => prepareTextFrame('M', { columns: 3, wrap: true }), /does not fit/);
  assert.equal(prepareTextFrame('A\n\nB', { columns: 3 }).split('\n').length, 9);
});

test('empty and unsupported text policies are explicit', () => {
  assert.equal(prepareTextFrame(''), [' '.repeat(76), ' '.repeat(76), ' '.repeat(76)].join('\n'));
  assert.equal(prepareTextFrame('🙂'), prepareTextFrame(' '));
  assert.throws(() => prepareTextFrame('🙂', { unsupported: 'error' }), /Unsupported glyph/);
  assert.throws(() => prepareTextFrame(42), /string/);
});

test('text layout rejects invalid dimensions, policies and overflow', () => {
  for (const columns of [0, -1, 1.5, NaN, Infinity, 513]) assert.throws(() => prepareTextFrame('A', { columns }), RangeError);
  for (const options of [null, { align: null }, { align: 'middle' }, { unsupported: 'ignore' }, { wrap: 'yes' }]) assert.throws(() => prepareTextFrame('A', options), TypeError);
  for (const options of [{ letterSpacing: -1 }, { lineGap: 1.2 }, { rows: 2 }]) assert.throws(() => prepareTextFrame('A', options), RangeError);
});

test('text-only scenes compose and share a grid during SSR', () => {
  assert.equal(typeof document, 'undefined');
  const frames = prepareFrames([
    { label: 'A then B', nodes: [{ type: 'text', text: 'A' }, { type: 'text', text: 'B', align: 'right' }] },
    scene('C'),
  ], { columns: 7, gap: 1 });
  assert.deepEqual(frames.map(f => f.ascii.split('\n').length), [5, 5]);
  assert.ok(frames.every(f => f.ascii.split('\n').every(row => row.length === 7)));
  assert.equal(frames[0].ascii.split('\n')[3], '    █▄▄');
  assert.equal(frames[1].ascii.split('\n')[4], '       ');
  assert.equal(prepareFrames([scene('A')], { columns: 7, rows: 4 })[0].ascii.split('\n').length, 4);
});

test('invalid composition fails clearly without browser globals', () => {
  for (const scenes of [[], [null], [{ label: 'Empty', nodes: [] }], [{ label: '', nodes: [{ type: 'text', text: 'A' }] }], [{ label: 'Invalid', nodes: [{ type: 'html' }] }]]) {
    assert.throws(() => prepareFrames(scenes), TypeError);
  }
  assert.throws(() => prepareFrames([scene('A')], { rows: 1 }), /needs 2 rows/);
  assert.throws(() => prepareFrames([{ label: 'SVG', nodes: [{ type: 'svg', path: 'M1 1H20V20Z' }] }]), /browser document/);
});

test('path command groups, arc flags and finite coordinates are validated', () => {
  for (const path of ['M1 1H20V20H1Z', 'm1e-2 -.5 2 3z', 'M0 0A1 1 0 01 2 3Z']) assert.doesNotThrow(() => validatePath(path));
  for (const path of ['', 'hello', '<svg/>', 'L0 0', 'M0', 'M0 0H', 'M0 0A1 1 0 2 0 2 3', 'M0 0L1e999 2', 'M0 0Z1 1', ',M0 0', 'M,0 0', 'M0 0,', 'M0 0,,L1 1']) assert.throws(() => validatePath(path), TypeError);
});

test('mount validation precedes DOM ownership and scheduling', () => {
  assert.throws(() => mountDisplay(null, []), /at least one frame/);
  assert.throws(() => mountDisplay(null, [{ ...frame, ascii: 'XX\nX' }]), /same non-empty glyph grid/);
  for (const options of [null, { autoplay: null }, { variant: 'canvas' }, { transition: 'fade' }, { autoplay: 'yes' }, { advanceOnClick: 1 }, { pauseOnHover: 0 }]) assert.throws(() => mountDisplay(null, [frame], options), TypeError);
  for (const options of [{ interval: 0 }, { duration: -1 }, { duration: Infinity }, { interval: 2147483648 }]) assert.throws(() => mountDisplay(null, [frame], options), RangeError);
  assert.throws(() => mountDisplay(null, [frame]), /browser element/);
});
