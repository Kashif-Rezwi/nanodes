import { createMorph } from './transition.js';
import type { GlyphFrame, DisplayOptions, DisplayController } from './types.js';
import { validateDisplay } from './display-options.js';
import { choice } from './validation.js';

/** Mount prepared text or image frames into a caller-owned host. */
export function mountDisplay(host: HTMLElement, input: readonly GlyphFrame[], options: DisplayOptions = {}): DisplayController {
  const config = validateDisplay(input, options);
  if (!host?.ownerDocument?.defaultView || typeof host.append !== 'function') {
    throw new TypeError('Mounting requires a browser element.');
  }
  const frames = input.map(frame => ({ ...frame }));
  const { columns, rows, variant } = config;
  let playing = config.autoplay;
  let transition = config.transition;
  const doc = host.ownerDocument;
  const win = doc.defaultView!;
  if (typeof win.matchMedia !== 'function' || typeof win.requestAnimationFrame !== 'function' || !win.CSS?.supports) {
    throw new Error('Display requires matchMedia, requestAnimationFrame, and CSS.supports.');
  }
  const reducedMotion = win.matchMedia('(prefers-reduced-motion: reduce)');
  if (frames.some(frame => !win.CSS.supports('color', frame.color))) throw new TypeError('Invalid frame color.');
  const container = doc.createElement('div');
  container.className = 'nanodes-display nanodes-' + variant;
  const interactive = config.advanceOnClick && frames.length > 1;
  if (interactive) container.tabIndex = 0;
  container.setAttribute('role', interactive ? 'button' : 'img');
  const wrapper = doc.createElement('div');
  wrapper.className = variant === 'text' ? 'nanodes-text-wrapper' : 'nanodes-visual-wrapper';
  const display = doc.createElement('pre');
  display.className = variant === 'text' ? 'nanodes-text-art' : 'nanodes-art';
  display.style.setProperty('--nanodes-columns', String(columns));
  display.style.setProperty('--nanodes-rows', String(rows));
  display.setAttribute('aria-hidden', 'true');
  wrapper.append(display);
  if (variant === 'image') {
    const glow = doc.createElement('div');
    glow.className = 'nanodes-ambient-glow';
    container.append(glow);
  }
  container.append(wrapper);
  host.append(container);

  const morph = createMorph(display, columns, rows, reducedMotion, config.duration);
  let index = 0;
  let interval: number | null = null;
  let destroyed = false;

  function switchItem(nextIndex: number, immediate = false) {
    if (destroyed) return;
    index = (nextIndex + frames.length) % frames.length;
    const target = frames[index];
    container.style.setProperty('--nanodes-color', target.color);
    container.setAttribute('aria-label', interactive ? target.label + '. Show next item' : target.label);
    if (immediate || transition === 'none' || config.duration === 0) {
      morph.cancel();
      display.textContent = target.ascii;
    } else morph.morphTo(target.ascii);
  }
  function stopCycle() {
    if (interval !== null) win.clearInterval(interval);
    interval = null;
  }
  function startCycle() {
    if (destroyed || !playing || frames.length < 2 || reducedMotion.matches || doc.hidden) return;
    stopCycle();
    interval = win.setInterval(() => switchItem(index + 1), config.interval);
  }
  function next() {
    if (destroyed || frames.length < 2) return;
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
  if (interactive) {
    container.addEventListener('click', onClick);
    container.addEventListener('keydown', onKeyDown);
  }
  if (config.pauseOnHover) {
    container.addEventListener('mouseenter', stopCycle);
    container.addEventListener('mouseleave', startCycle);
  }
  reducedMotion.addEventListener('change', onMotionChange);
  doc.addEventListener('visibilitychange', onVisibilityChange);
  switchItem(0, !playing || frames.length < 2);
  startCycle();

  return {
    next,
    play() { if (!destroyed) { playing = true; startCycle(); } },
    pause() { playing = false; stopCycle(); },
    setTransition(value) {
      if (destroyed) return;
      transition = choice(value, ['shimmer', 'none'], 'transition');
      if (transition === 'none') {
        morph.cancel();
        display.textContent = frames[index].ascii;
      }
    },
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
