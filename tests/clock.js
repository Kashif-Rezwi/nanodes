// Controlled time/randomness only in local comparison fixtures, never in the library.
if (location.search.includes('test')) {
  let now = 100, nextId = 1, seed = 7;
  const frames = new Map(), intervals = new Map();
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
    get pending() { return { frames: frames.size, intervals: intervals.size }; },
  };
}
