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
  let hovered = false;
  let focused = false;
  let spacePressed = false;
  let visible = true;

  function settle() {
    morph.cancel();
    if (display.textContent !== frames[index].ascii) display.textContent = frames[index].ascii;
  }
  function switchItem(nextIndex: number, immediate = false) {
    if (destroyed) return;
    index = (nextIndex + frames.length) % frames.length;
    const target = frames[index];
    container.style.setProperty('--nanodes-color', target.color);
    container.setAttribute('aria-label', interactive ? target.label + '. Show next item' : target.label);
    if (immediate || doc.hidden || !visible || transition === 'none' || config.duration === 0) settle();
    else morph.morphTo(target.ascii);
  }
  function stopCycle() {
    if (interval !== null) win.clearInterval(interval);
    interval = null;
  }
  function syncPlayback() {
    stopCycle();
    if (destroyed || !playing || frames.length < 2 || reducedMotion.matches || doc.hidden || !visible || hovered || focused) return;
    interval = win.setInterval(() => switchItem(index + 1), config.interval);
  }
  function next() {
    if (destroyed || frames.length < 2) return;
    switchItem(index + 1);
    syncPlayback();
  }
  function onClick(event: MouseEvent) { event.preventDefault(); next(); }
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!event.repeat) {
        if (event.key === ' ') spacePressed = true;
        else next();
      }
    }
  }
  function onKeyUp(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
      const activate = spacePressed && !event.repeat;
      spacePressed = false;
      if (activate) next();
    }
  }
  function onEnter() { hovered = true; syncPlayback(); }
  function onLeave() { hovered = false; syncPlayback(); }
  function onFocus() { focused = true; syncPlayback(); }
  function onBlur(event: FocusEvent) {
    if (event.relatedTarget instanceof win.Node && container.contains(event.relatedTarget)) return;
    focused = false;
    spacePressed = false;
    syncPlayback();
  }
  function onMotionChange() {
    if (reducedMotion.matches) settle();
    syncPlayback();
  }
  function onVisibilityChange() {
    if (doc.hidden) { spacePressed = false; settle(); }
    syncPlayback();
  }
  const observer = config.pauseWhenOffscreen && typeof win.IntersectionObserver === 'function'
    ? new win.IntersectionObserver(([entry]) => {
        if (destroyed) return;
        visible = entry.isIntersecting;
        if (!visible) settle();
        syncPlayback();
      })
    : null;
  if (interactive) {
    container.addEventListener('click', onClick);
    container.addEventListener('keydown', onKeyDown);
    container.addEventListener('keyup', onKeyUp);
    container.addEventListener('focusin', onFocus);
    container.addEventListener('focusout', onBlur);
  }
  if (config.pauseOnHover) {
    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);
  }
  reducedMotion.addEventListener('change', onMotionChange);
  doc.addEventListener('visibilitychange', onVisibilityChange);
  switchItem(0, !playing || frames.length < 2);
  syncPlayback();
  observer?.observe(container);

  return {
    next,
    play() { if (!destroyed) { playing = true; syncPlayback(); } },
    pause() { playing = false; stopCycle(); },
    setTransition(value) {
      if (destroyed) return;
      transition = choice(value, ['shimmer', 'none'], 'transition');
      if (transition === 'none') settle();
    },
    show(nextIndex: number) {
      if (destroyed) return;
      if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= frames.length) {
        throw new RangeError('Frame index is outside the sequence.');
      }
      switchItem(nextIndex);
      syncPlayback();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stopCycle();
      morph.cancel();
      observer?.disconnect();
      container.removeEventListener('click', onClick);
      container.removeEventListener('keydown', onKeyDown);
      container.removeEventListener('keyup', onKeyUp);
      container.removeEventListener('focusin', onFocus);
      container.removeEventListener('focusout', onBlur);
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('mouseleave', onLeave);
      reducedMotion.removeEventListener('change', onMotionChange);
      doc.removeEventListener('visibilitychange', onVisibilityChange);
      container.remove();
    },
  };
}
