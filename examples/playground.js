import { mountDisplay, prepareImageFrames, prepareFrames } from '/dist/index.js';
import { shapes } from './shapes.js';

const form = document.getElementById('controls');
const content = document.getElementById('content');
const text = document.getElementById('text');
const shape = document.getElementById('shape');
const playback = document.getElementById('playback');
const transition = document.getElementById('transition');
const next = document.getElementById('next');
const toggle = document.getElementById('toggle');
const align = document.getElementById('align');
const wrap = document.getElementById('wrap');
const error = document.getElementById('error');
const host = document.getElementById('display');
// Prepare SVG samples once; editing text or playback should not resample images.
const images = prepareImageFrames(shapes);
const compositions = prepareFrames(shapes.map(item => ({
  label: item.name + ' sample', color: item.color,
  nodes: [
    { type: 'text', text: 'NANODES', align: 'center' },
    { type: 'svg', path: item.svg },
    { type: 'text', text: item.name + '\nPURE GLYPHS', align: 'center', wrap: true },
  ],
})), { columns: 52, gap: 1 });
let controller;
let paused = false;

function render() {
  try {
    const frames = content.value === 'text'
      ? prepareFrames(text.value.split(/\n\s*\n/).map(item => item.trim()).filter(Boolean).map(label => ({
          label, nodes: [{ type: 'text', text: label, align: align.value, wrap: wrap.checked }],
        })), { columns: 76 })
      : (content.value === 'combined' ? compositions : images).filter((_, index) => shape.value === 'all' || shapes[index].id === shape.value);
    if (content.value === 'text') {
      for (const frame of frames) frame.ascii = ' '.repeat(76) + '\n' + frame.ascii;
    }
    // Mount first so validation failure leaves the current display intact.
    const replacement = mountDisplay(host, frames, {
      variant: content.value === 'text' ? 'text' : 'image',
      autoplay: playback.value === 'cycle',
      transition: transition.value,
    });
    controller?.destroy();
    controller = replacement;
    paused = false;
    toggle.textContent = 'Pause';
    toggle.hidden = playback.value !== 'cycle' || frames.length < 2;
    next.disabled = frames.length < 2;
    const cycling = playback.value === 'cycle' && frames.length > 1;
    document.getElementById('summary').textContent = `${frames.length} ${frames.length === 1 ? 'item' : 'items'} / ${cycling ? 'cycling' : 'static'}`;
    document.getElementById('hint').textContent = cycling
      ? 'Hover to pause. Reduced motion disables cycling.'
      : 'Static until you advance.';
    error.hidden = true;
    text.removeAttribute('aria-invalid');
  } catch (cause) {
    error.textContent = cause.message;
    error.hidden = false;
    text.setAttribute('aria-invalid', 'true');
  }
}
content.addEventListener('change', () => {
  document.getElementById('text-fields').hidden = content.value !== 'text';
  document.getElementById('image-fields').hidden = content.value === 'text';
  render();
});
for (const control of [shape, playback, transition, align, wrap]) control.addEventListener('change', render);
form.addEventListener('submit', event => { event.preventDefault(); render(); });
next.addEventListener('click', () => controller?.next());
toggle.addEventListener('click', () => {
  paused = !paused;
  if (paused) controller.pause(); else controller.play();
  toggle.textContent = paused ? 'Play' : 'Pause';
});
window.addEventListener('pagehide', () => controller?.destroy(), { once: true });
render();
