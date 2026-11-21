import type { DisplayOptions, GlyphFrame } from './types.js';
import { booleanOption, checkOptions, choice, integer, milliseconds, nonempty } from './validation.js';

/** Validate before attaching DOM or scheduling work. Snapshot options per instance. */
export function validateDisplay(frames: readonly GlyphFrame[], options: DisplayOptions) {
  checkOptions(options);
  if (!Array.isArray(frames) || !frames.length) throw new TypeError('The display needs at least one frame.');
  for (const frame of frames) {
    if (!frame || typeof frame.ascii !== 'string') throw new TypeError('A frame needs an ascii string.');
    nonempty(frame.label, 'Frame label');
    nonempty(frame.color, 'Frame color');
  }
  const lines = frames[0].ascii.split('\n');
  const columns = integer(lines[0].length, 'columns');
  const rows = integer(lines.length, 'rows');
  if (!frames.every((frame: GlyphFrame) => {
    const frameRows = frame.ascii.split('\n');
    return frameRows.length === rows && frameRows.every((row: string) => row.length === columns);
  })) throw new RangeError('Frames must share the same non-empty glyph grid.');
  return {
    columns, rows,
    variant: choice(options.variant ?? 'image', ['text', 'image'], 'variant'),
    transition: choice(options.transition ?? 'shimmer', ['shimmer', 'none'], 'transition'),
    autoplay: booleanOption(options.autoplay ?? true, 'autoplay'),
    pauseOnHover: booleanOption(options.pauseOnHover ?? true, 'pauseOnHover'),
    pauseWhenOffscreen: booleanOption(options.pauseWhenOffscreen ?? true, 'pauseWhenOffscreen'),
    advanceOnClick: booleanOption(options.advanceOnClick ?? true, 'advanceOnClick'),
    duration: milliseconds(options.duration ?? 320, 'duration', 0),
    interval: milliseconds(options.interval ?? 3400, 'interval', 1),
  };
}
