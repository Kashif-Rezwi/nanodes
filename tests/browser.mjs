import { prepareTextFrame } from '/dist/text.js';
const result = document.getElementById('result');
window.runParityChecks = async () => {
  const a = document.getElementById('original').contentWindow;
  const b = document.getElementById('extracted').contentWindow;
  if (!a.reference || !b.extracted) throw new Error('Reference frames are not ready. Generate fixtures and reload.');
  const checks = [];
  const assert = (condition, message) => { if (!condition) throw new Error(message); checks.push(message); };
  const textA = () => a.document.getElementById('tech-ascii-display').textContent;
  const textB = () => b.document.querySelector('.nanodes-art').textContent;
  const tick = delta => { a.testClock.tick(delta); b.testClock.tick(delta); };
  const event = name => {
    a.document.getElementById('ascii-interactive-zone').dispatchEvent(new a.MouseEvent(name));
    b.document.querySelector('.nanodes-display').dispatchEvent(new b.MouseEvent(name));
  };
  assert(a.reference.frames.length === 25 && b.extracted.frames.length === 25, '25 reference shapes loaded');
  assert(a.reference.frames.every((frame, i) => frame.ascii === b.extracted.frames[i].ascii), 'All 25 settled SVG/label frames match byte for byte');
  const { ROLE_FRAMES } = await import('/.reference/roles.js');
  assert(prepareTextFrame('FULL STACK ENGINEER') === ROLE_FRAMES[0], 'Static hero matches independent source output');
  assert(textA() === textB(), 'Initial contact frame matches');
  event('click');
  for (const delta of [16, 40, 80, 80, 120]) { tick(delta); assert(textA() === textB(), `First transition matches at step ${delta}`); }
  event('click'); tick(16); tick(80); event('click');
  for (const delta of [16, 100, 240]) { tick(delta); assert(textA() === textB(), `Interrupted transition matches at step ${delta}`); }
  event('mouseenter');
  assert(a.testClock.pending.intervals === 0 && b.testClock.pending.intervals === 0, 'Hover pauses both intervals');
  event('click');
  assert(a.testClock.pending.intervals === 1 && b.testClock.pending.intervals === 0, 'Hardened hover policy holds autoplay after manual selection');
  event('mouseleave');
  tick(16); tick(320); tick(3400); tick(320);
  assert(textA() === textB(), 'Automatic cycle matches');
  a.testClock.reduced(true); b.testClock.reduced(true);
  assert(textA() === textB() && a.testClock.pending.frames === 0 && a.testClock.pending.intervals === 0 && b.testClock.pending.frames === 0 && b.testClock.pending.intervals === 0, 'Reduced motion settles and stops scheduling');
  event('click');
  assert(textA() === textB() && b.testClock.pending.frames === 0, 'Reduced-motion manual advance is immediate');
  a.testClock.reduced(false); b.testClock.reduced(false);
  event('click'); tick(16); tick(60);
  const partial = textB();
  for (const win of [a, b]) { Object.defineProperty(win.document, 'hidden', { configurable: true, value: true }); win.document.dispatchEvent(new win.Event('visibilitychange')); }
  assert(a.testClock.pending.frames === 0 && b.testClock.pending.frames === 0 && b.testClock.pending.intervals === 0, 'Hidden document cancels transition and cycling');
  tick(500);
  const selectedLabel = b.document.querySelector('.nanodes-display').getAttribute('aria-label').replace(/\. Show next item$/, '');
  const selectedAscii = b.extracted.frames.find(frame => frame.label === selectedLabel).ascii;
  assert(textA() === partial && textB() === selectedAscii, 'Hidden display settles its target instead of preserving the source partial frame');
  for (const win of [a, b]) { Object.defineProperty(win.document, 'hidden', { configurable: true, value: false }); win.document.dispatchEvent(new win.Event('visibilitychange')); }
  assert(textA() === partial && textB() === selectedAscii && b.testClock.pending.intervals === 1, 'Visible display restarts cycling from a readable settled target');

  // Compare visible rendering properties in the same browser/viewport.
  const original = a.document.getElementById('tech-ascii-display');
  const extracted = b.document.querySelector('.nanodes-art');
  const properties = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color', 'width', 'height', 'filter', 'whiteSpace'];
  assert(properties.every(key => a.getComputedStyle(original)[key] === b.getComputedStyle(extracted)[key]), 'Contact text typography, dimensions, color, and glow match');
  const originalBox = a.getComputedStyle(a.document.getElementById('ascii-interactive-zone'));
  const extractedBox = b.getComputedStyle(b.document.querySelector('.nanodes-display'));
  assert(['width', 'height', 'paddingTop', 'paddingLeft', 'boxSizing'].every(key => originalBox[key] === extractedBox[key]), 'Outer sizing and padding match the source');
  b.extracted.controller.destroy(); b.extracted.controller.destroy();
  assert(b.testClock.pending.frames === 0 && b.testClock.pending.intervals === 0 && !b.document.querySelector('.nanodes-display'), 'Destroy removes owned work and DOM, and is idempotent');
  a.reference.stopAutoCycle();

  result.textContent = `${checks.length} checks passed.\n` + checks.join('\n');
  return checks;
};
document.getElementById('run').addEventListener('click', async () => {
  // Reload this page before rerunning: the final check deliberately destroys the instance.
  try { await window.runParityChecks(); }
  catch (error) { result.textContent = 'FAILED: ' + error.message; console.error(error); }
});
