export function runDisplayChecks(win, api, assert) {
  const { mountDisplay, prepareImageFrames, prepareTextFrame: prepareText } = api;
  const tick = delta => win.testClock.tick(delta);
  const host = win.document.createElement('div');
  win.document.body.append(host);
  const textFrames = ['HELLO', 'NANODES'].map(label => ({ ascii: prepareText(label), label, color: '#a9c8ff' }));
  const imageFrames = prepareImageFrames([{ name: 'Square', color: '#a9c8ff', svg: 'M2 2H22V22H2Z' }]);
  const staticText = mountDisplay(host, textFrames, { variant: 'text', autoplay: false });
  const textArt = host.querySelector('.nanodes-text-art');
  assert(textArt.textContent === textFrames[0].ascii && win.testClock.pending.frames === 0 && win.testClock.pending.intervals === 0, 'Static text starts settled without scheduled work');
  const imageHost = win.document.createElement('div');
  win.document.body.append(imageHost);
  const staticImage = mountDisplay(imageHost, imageFrames, { autoplay: false });
  staticText.next(); tick(16); tick(320);
  assert(textArt.textContent === textFrames[1].ascii && win.testClock.pending.intervals === 0, 'Static mode supports manual shimmer without starting autoplay');
  assert(imageHost.querySelector('.nanodes-art').textContent === imageFrames[0].ascii, 'Text and image instances operate independently');
  host.querySelector('.nanodes-display').dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
  tick(16); tick(320);
  assert(textArt.textContent === textFrames[0].ascii, 'Keyboard advance works for text');
  let invalidIndex = false;
  try { staticText.show(2); } catch (error) { invalidIndex = error instanceof win.RangeError; }
  assert(invalidIndex && textArt.textContent === textFrames[0].ascii, 'Invalid selection leaves the current frame intact');
  staticText.destroy(); staticImage.destroy();

  const instant = mountDisplay(host, textFrames, { variant: 'text', transition: 'none' });
  instant.show(1);
  assert(host.querySelector('.nanodes-text-art').textContent === textFrames[1].ascii && win.testClock.pending.frames === 0, 'Instant transitions assign the target without an animation loop');
  tick(3400);
  assert(host.querySelector('.nanodes-text-art').textContent === textFrames[0].ascii, 'Text sequences cycle with the shared playback controller');
  instant.destroy();
  const single = mountDisplay(host, [textFrames[0]], { variant: 'text' });
  single.next();
  assert(win.testClock.pending.frames === 0 && win.testClock.pending.intervals === 0 && host.querySelector('[role="img"]'), 'Single-item displays remain static even with autoplay requested');
  single.destroy();
  let invalidGrid = false;
  try { mountDisplay(host, [{ ascii: 'XX\nX', label: 'Invalid', color: '#fff' }]); } catch { invalidGrid = true; }
  assert(invalidGrid && host.childElementCount === 0, 'Invalid grids fail before creating DOM or scheduled work');
  assert(win.testClock.pending.frames === 0 && win.testClock.pending.intervals === 0, 'All additional instances clean up their scheduled work');
  host.remove(); imageHost.remove();
}

export function runApiChecks(win, api, assert) {
  const { mountDisplay, prepareFrames, prepareImageFrames, prepareTextFrame } = api;
  const host = win.document.createElement('div');
  win.document.body.append(host);
  const frames = ['A', 'B'].map(label => ({ label, color: '#a9c8ff', ascii: prepareTextFrame(label) }));
  const tick = delta => win.testClock.tick(delta);
  const art = () => host.querySelector('pre').textContent;
  const pending = () => win.testClock.pending;
  const dispatch = name => host.querySelector('.nanodes-display').dispatchEvent(new win.MouseEvent(name));
  const options = { variant: 'text', autoplay: false, duration: 80, interval: 120 };
  const display = mountDisplay(host, frames, options);
  display.play(); display.play();
  assert(pending().intervals === 1, 'Repeated play owns only one timer');
  options.interval = 9000;
  tick(120); tick(80);
  assert(art() === frames[1].ascii, 'Custom timing is applied and options are snapshotted');
  display.pause();
  dispatch('mouseleave');
  win.document.dispatchEvent(new win.Event('visibilitychange'));
  win.testClock.reduced(true); win.testClock.reduced(false);
  display.next(); tick(16); tick(80);
  assert(pending().intervals === 0 && art() === frames[0].ascii, 'Manual pause survives hover, visibility, motion changes, and manual advance');
  display.play();
  assert(pending().intervals === 1, 'Play resumes after a manual pause');
  display.setTransition('none');
  const current = art();
  assert(current === frames[0].ascii && pending().intervals === 1, 'Changing transition preserves the selected frame and playback timer');
  display.next();
  assert(art() === frames[1].ascii && pending().frames === 0, 'Instant mode applies to the next selection without remounting');
  display.setTransition('shimmer');
  display.next(); tick(16);
  assert(pending().frames === 1, 'Shimmer can resume on the same display');
  display.setTransition('none');
  assert(art() === frames[0].ascii && pending().frames === 0, 'Changing to instant settles an active morph');
  assert(rejects(() => display.setTransition('invalid'), /Invalid transition/) && art() === frames[0].ascii && pending().intervals === 1, 'Invalid transition changes leave content and playback intact');
  display.destroy();

  const sourceFrames = frames.map(frame => ({ ...frame }));
  const quiet = mountDisplay(host, sourceFrames, { variant: 'text', advanceOnClick: false, pauseOnHover: false, duration: 0, interval: 120 });
  sourceFrames[1].ascii = sourceFrames[0].ascii;
  sourceFrames[1].label = 'Mutated';
  dispatch('mouseenter'); dispatch('click');
  assert(pending().intervals === 1 && art() === frames[0].ascii && host.querySelector('[role="img"]') && !host.querySelector('[tabindex]'), 'Disabled pointer controls do not change selection, timer, or semantics');
  tick(120);
  assert(art() === frames[1].ascii && pending().frames === 0, 'Zero-duration playback settles immediately and uses snapshotted frames');
  quiet.next();
  assert(art() === frames[0].ascii, 'Programmatic advance remains available without click controls');
  quiet.destroy();

  const path = 'M2 2H22V22H2Z';
  const mixed = prepareFrames([
    { label: 'Square and caption', nodes: [{ type: 'svg', path }, { type: 'text', text: 'A\nB', align: 'center' }] },
    { label: 'Text alone', nodes: [{ type: 'text', text: 'HELLO' }] },
  ], { columns: 38, gap: 1 });
  assert(mixed.every(frame => frame.ascii.split('\n').length === 18), 'Mixed node sequences normalize different scene heights');
  assert(mixed[0].ascii.split('\n')[13].trim() === '█▀█' && mixed[0].ascii.split('\n')[16].trim() === '█▄▄', 'SVG and multiline text share one vertically composed frame');
  const composed = mountDisplay(host, mixed, { autoplay: false });
  composed.show(1); tick(16); tick(320);
  assert(art() === mixed[1].ascii, 'The original transition handles mixed image and text scenes');
  composed.destroy();

  function rejects(work, pattern) {
    try { work(); return false; } catch (error) { return pattern.test(error.message); }
  }
  assert(rejects(() => prepareFrames([{ label: 'Bad SVG', nodes: [{ type: 'svg', path: 'M0 0L' }] }]), /Invalid SVG path/), 'Truncated SVG commands fail clearly');
  assert(rejects(() => prepareFrames([{ label: 'Empty SVG', nodes: [{ type: 'svg', path: 'M0 0Z' }] }]), /filled area/), 'Unrenderable SVG paths fail clearly');
  assert(rejects(() => prepareImageFrames([{ name: 'A', color: '#fff', svg: path, scaleModifier: 0 }]), /positive and finite/), 'Invalid SVG scale fails before sampling');
  assert(rejects(() => mountDisplay(host, [{ ...frames[0], color: 'not-a-color' }]), /Invalid frame color/) && host.childElementCount === 0, 'Invalid CSS colors fail without attaching DOM');
  const getContext = win.HTMLCanvasElement.prototype.getContext;
  try {
    win.HTMLCanvasElement.prototype.getContext = () => null;
    assert(rejects(() => prepareImageFrames([{ name: 'A', color: '#fff', svg: path }]), /Canvas 2D support/), 'Missing Canvas support fails explicitly');
  } finally { win.HTMLCanvasElement.prototype.getContext = getContext; }
  display.play(); display.pause(); display.next(); display.show(0); display.setTransition('shimmer'); display.destroy();
  assert(pending().frames === 0 && pending().intervals === 0 && host.childElementCount === 0, 'Destroyed controllers remain inert and all API fixtures clean up');
  host.remove();
}
