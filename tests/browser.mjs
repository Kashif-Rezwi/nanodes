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
  assert(a.testClock.pending.intervals === 1 && b.testClock.pending.intervals === 1, 'Click restarts cycling while hovered, as in source');
  tick(16); tick(320); tick(3400); tick(320);
  assert(textA() === textB(), 'Automatic cycle matches');
  a.testClock.reduced(true); b.testClock.reduced(true);
  assert(textA() === textB() && b.testClock.pending.frames === 0 && b.testClock.pending.intervals === 0, 'Reduced motion settles and stops scheduling');
  event('click');
  assert(textA() === textB() && b.testClock.pending.frames === 0, 'Reduced-motion manual advance is immediate');
  a.testClock.reduced(false); b.testClock.reduced(false);
  event('click'); tick(16); tick(60);
  const partial = textB();
  for (const win of [a, b]) { Object.defineProperty(win.document, 'hidden', { configurable: true, value: true }); win.document.dispatchEvent(new win.Event('visibilitychange')); }
  assert(a.testClock.pending.frames === 0 && b.testClock.pending.frames === 0 && b.testClock.pending.intervals === 0, 'Hidden document cancels transition and cycling');
  tick(500);
  assert(textA() === textB() && textB() === partial, 'Hidden document preserves the original partial frame');
  for (const win of [a, b]) { Object.defineProperty(win.document, 'hidden', { configurable: true, value: false }); win.document.dispatchEvent(new win.Event('visibilitychange')); }
  assert(textA() === textB() && textB() === partial && b.testClock.pending.intervals === 1, 'Visible document restarts cycling without changing the partial frame');

  // Compare visible rendering properties in the same browser/viewport.
  const original = a.document.getElementById('tech-ascii-display');
  const extracted = b.document.querySelector('.nanodes-art');
  const properties = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color', 'width', 'height', 'filter', 'whiteSpace'];
  assert(properties.every(key => a.getComputedStyle(original)[key] === b.getComputedStyle(extracted)[key]), 'Contact text typography, dimensions, color, and glow match');
  b.extracted.controller.destroy(); b.extracted.controller.destroy();
  assert(b.testClock.pending.frames === 0 && b.testClock.pending.intervals === 0 && !b.document.querySelector('.nanodes-display'), 'Destroy removes owned work and DOM, and is idempotent');
  a.reference.stopAutoCycle();

  const { mountDisplay, prepareTextFrame: prepareText } = b.extracted;
  const host = b.document.createElement('div');
  b.document.body.append(host);
  const textFrames = ['HELLO', 'NANODES'].map(label => ({ ascii: prepareText(label), label, color: '#a9c8ff' }));
  const staticText = mountDisplay(host, textFrames, { variant: 'text', autoplay: false });
  const textArt = host.querySelector('.nanodes-text-art');
  assert(textArt.textContent === textFrames[0].ascii && b.testClock.pending.frames === 0 && b.testClock.pending.intervals === 0, 'Static text starts settled without scheduled work');
  const imageHost = b.document.createElement('div');
  b.document.body.append(imageHost);
  const staticImage = mountDisplay(imageHost, b.extracted.frames, { autoplay: false });
  staticText.next(); tick(16); tick(320);
  assert(textArt.textContent === textFrames[1].ascii && b.testClock.pending.intervals === 0, 'Static mode supports manual shimmer without starting autoplay');
  assert(imageHost.querySelector('.nanodes-art').textContent === b.extracted.frames[0].ascii, 'Text and image instances operate independently');
  host.querySelector('.nanodes-display').dispatchEvent(new b.KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
  tick(16); tick(320);
  assert(textArt.textContent === textFrames[0].ascii, 'Keyboard advance works for text');
  let invalidIndex = false;
  try { staticText.show(2); } catch (error) { invalidIndex = error instanceof b.RangeError; }
  assert(invalidIndex && textArt.textContent === textFrames[0].ascii, 'Invalid selection leaves the current frame intact');
  staticText.destroy(); staticImage.destroy();

  const instant = mountDisplay(host, textFrames, { variant: 'text', transition: 'none' });
  instant.show(1);
  assert(host.querySelector('.nanodes-text-art').textContent === textFrames[1].ascii && b.testClock.pending.frames === 0, 'Instant transitions assign the target without an animation loop');
  tick(3400);
  assert(host.querySelector('.nanodes-text-art').textContent === textFrames[0].ascii, 'Text sequences cycle with the shared playback controller');
  instant.destroy();
  const single = mountDisplay(host, [textFrames[0]], { variant: 'text' });
  single.next();
  assert(b.testClock.pending.frames === 0 && b.testClock.pending.intervals === 0 && host.querySelector('[role="img"]'), 'Single-item displays remain static even with autoplay requested');
  single.destroy();
  let invalidGrid = false;
  try { mountDisplay(host, [{ ascii: 'XX\nX', label: 'Invalid', color: '#fff' }]); } catch { invalidGrid = true; }
  assert(invalidGrid && host.childElementCount === 0, 'Invalid grids fail before creating DOM or scheduled work');
  assert(b.testClock.pending.frames === 0 && b.testClock.pending.intervals === 0, 'All additional instances clean up their scheduled work');
  host.remove(); imageHost.remove();
  result.textContent = `${checks.length} checks passed.\n` + checks.join('\n');
  return checks;
};
document.getElementById('run').addEventListener('click', async () => {
  // Reload this page before rerunning: the final check deliberately destroys the instance.
  try { await window.runParityChecks(); }
  catch (error) { result.textContent = 'FAILED: ' + error.message; console.error(error); }
});
