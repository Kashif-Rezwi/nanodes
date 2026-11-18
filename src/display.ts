import { createMorph } from './transition.js';

export interface GlyphFrame {
  ascii: string;
  label: string;
  color: string;
}

export interface DisplayOptions {
  autoplay?: boolean;
  transition?: 'shimmer' | 'none';
  variant?: 'text' | 'image';
}

/** Mount prepared text or image frames into a caller-owned host. */
export function mountDisplay(host: HTMLElement, frames: readonly GlyphFrame[], options: DisplayOptions = {}) {
  if (!frames.length) throw new Error('The display needs at least one frame.');
  const lines = frames[0].ascii.split('\n');
  const columns = lines[0].length;
  const rows = lines.length;
  if (!columns || !frames.every(frame => {
    const frameRows = frame.ascii.split('\n');
    return frameRows.length === rows && frameRows.every(row => row.length === columns);
  })) throw new Error('Frames must share the same non-empty glyph grid.');
  const variant = options.variant ?? 'image';
  const autoplay = options.autoplay !== false && frames.length > 1;
  const doc = host.ownerDocument;
  const win = doc.defaultView!;
  const container = doc.createElement('div');
  container.className = 'nanodes-display nanodes-' + variant;
  const interactive = frames.length > 1;
  if (interactive) container.tabIndex = 0;
  container.setAttribute('role', interactive ? 'button' : 'img');
  const glow = doc.createElement('div');
  glow.className = 'nanodes-ambient-glow';
  const wrapper = doc.createElement('div');
  wrapper.className = variant === 'text' ? 'nanodes-text-wrapper' : 'nanodes-visual-wrapper';
  const display = doc.createElement('pre');
  display.className = variant === 'text' ? 'nanodes-text-art' : 'nanodes-art';
  display.style.setProperty('--nanodes-columns', String(columns));
  display.style.setProperty('--nanodes-rows', String(rows));
  display.setAttribute('aria-hidden', 'true');
  const equivalent = doc.createElement('span');
  equivalent.className = 'nanodes-sr-only';
  wrapper.append(display);
  if (variant === 'image') container.append(glow);
  container.append(wrapper, equivalent);
  host.append(container);

  const reducedMotion = win.matchMedia('(prefers-reduced-motion: reduce)');
  const morph = createMorph(display, columns, rows, reducedMotion);
  let index = 0;
  let interval: number | null = null;
  let destroyed = false;

  function switchItem(nextIndex: number, immediate = false) {
    if (destroyed) return;
    index = (nextIndex + frames.length) % frames.length;
    const target = frames[index];
    container.style.setProperty('--nanodes-color', target.color);
    equivalent.textContent = target.label;
    container.setAttribute('aria-label', interactive ? target.label + '. Show next item' : target.label);
    if (immediate || options.transition === 'none') {
      morph.cancel();
      display.textContent = target.ascii;
    } else morph.morphTo(target.ascii);
  }
  function stopCycle() {
    if (interval !== null) win.clearInterval(interval);
    interval = null;
  }
  function startCycle() {
    if (destroyed || !autoplay || reducedMotion.matches || doc.hidden) return;
    stopCycle();
    interval = win.setInterval(() => switchItem(index + 1), 3400);
  }
  function next() {
    if (destroyed || !interactive) return;
    switchItem(index + 1);
    startCycle(); // Preserve the reference's restart even while hovered.
  }
  function onClick(event: MouseEvent) { event.preventDefault(); next(); }
  function onKeyDown(event: KeyboardEvent) {
    if (!event.repeat && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); next(); }
  }
  function onMotionChange() {
    if (reducedMotion.matches) {
      stopCycle();
      morph.cancel();
      display.textContent = frames[index].ascii;
    } else startCycle();
  }
  function onVisibilityChange() {
    if (doc.hidden) { stopCycle(); morph.cancel(); }
    else startCycle(); // Preserve the original partial-frame resume behavior.
  }
  container.addEventListener('click', onClick);
  container.addEventListener('keydown', onKeyDown);
  container.addEventListener('mouseenter', stopCycle);
  container.addEventListener('mouseleave', startCycle);
  reducedMotion.addEventListener('change', onMotionChange);
  doc.addEventListener('visibilitychange', onVisibilityChange);
  switchItem(0, !autoplay);
  startCycle();

  return {
    next,
    show(nextIndex: number) {
      if (destroyed) return;
      if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= frames.length) {
        throw new RangeError('Frame index is outside the sequence.');
      }
      switchItem(nextIndex);
      startCycle();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stopCycle();
      morph.cancel();
      container.removeEventListener('click', onClick);
      container.removeEventListener('keydown', onKeyDown);
      container.removeEventListener('mouseenter', stopCycle);
      container.removeEventListener('mouseleave', startCycle);
      reducedMotion.removeEventListener('change', onMotionChange);
      doc.removeEventListener('visibilitychange', onVisibilityChange);
      container.remove();
    },
  };
}
