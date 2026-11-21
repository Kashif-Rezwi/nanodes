// Controlled time/randomness only in local comparison fixtures, never in the library.
if (location.search.includes('test')) {
  let now = 100, nextId = new URLSearchParams(location.search).has('zero') ? 0 : 1, seed = 7;
  const frames = new Map(), intervals = new Map();
  const observers = new Set(), listeners = [];
  let intersecting = true;
  const add = EventTarget.prototype.addEventListener, remove = EventTarget.prototype.removeEventListener;
  const capture = options => typeof options === 'boolean' ? options : !!options?.capture;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (listener && !listeners.some(item => item.target === this && item.type === type && item.listener === listener && item.capture === capture(options))) {
      listeners.push({ target: this, type, listener, capture: capture(options) });
    }
    return add.call(this, type, listener, options);
  };
  EventTarget.prototype.removeEventListener = function(type, listener, options) {
    const index = listeners.findIndex(item => item.target === this && item.type === type && item.listener === listener && item.capture === capture(options));
    if (index !== -1) listeners.splice(index, 1);
    return remove.call(this, type, listener, options);
  };
  window.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; this.targets = new Set(); }
    observe(target) { this.targets.add(target); observers.add(this); this.callback([{ target, isIntersecting: intersecting }]); }
    unobserve(target) { this.targets.delete(target); if (!this.targets.size) observers.delete(this); }
    disconnect() { this.targets.clear(); observers.delete(this); }
  };
  const motion = new EventTarget();
  motion.matches = false;
  window.matchMedia = () => motion;
  window.requestAnimationFrame = fn => { const id = nextId++; frames.set(id, fn); return id; };
  window.cancelAnimationFrame = id => frames.delete(id);
  window.setInterval = (fn, delay) => { const id = nextId++; intervals.set(id, { fn, delay, due: now + delay }); return id; };
  window.clearInterval = id => intervals.delete(id);
  Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  window.testClock = {
    tick(delta) {
      now += delta;
      for (const [id, timer] of [...intervals]) {
        if (intervals.has(id) && timer.due <= now) { timer.due = now + timer.delay; timer.fn(); }
      }
      const callbacks = [...frames.values()]; frames.clear();
      for (const fn of callbacks) fn(now);
    },
    reduced(value) { motion.matches = value; motion.dispatchEvent(new MediaQueryListEvent('change', { matches: value, media: '(prefers-reduced-motion: reduce)' })); },
    intersecting(value) {
      intersecting = value;
      for (const observer of [...observers]) observer.callback([...observer.targets].map(target => ({ target, isIntersecting: value })));
    },
    get pending() { return { frames: frames.size, intervals: intervals.size, observers: observers.size, listeners: listeners.length }; },
  };
}
