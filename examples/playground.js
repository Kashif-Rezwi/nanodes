import { mountDisplay, prepareImageFrames, prepareTextFrame } from '/dist/index.js';
import { shapes } from './shapes.js';

const form = document.getElementById('controls');
const content = document.getElementById('content');
const text = document.getElementById('text');
const shape = document.getElementById('shape');
const playback = document.getElementById('playback');
const transition = document.getElementById('transition');
const next = document.getElementById('next');
const error = document.getElementById('error');
const host = document.getElementById('display');
// Prepare SVG samples once; editing text or playback should not resample images.
const images = prepareImageFrames(shapes);
let controller;

function render() {
  try {
    const frames = content.value === 'text'
      ? text.value.split('\n').map(line => line.trim()).filter(Boolean).map(label => ({
          ascii: prepareTextFrame(label), label, color: '#a9c8ff',
        }))
      : images.filter((_, index) => shape.value === 'all' || shapes[index].id === shape.value);
    if (!frames.length) throw new Error('Enter at least one text item.');
    controller?.destroy();
    controller = mountDisplay(host, frames, {
      variant: content.value,
      autoplay: playback.value === 'cycle',
      transition: transition.value,
    });
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
  document.getElementById('image-fields').hidden = content.value !== 'image';
  render();
});
for (const control of [shape, playback, transition]) control.addEventListener('change', render);
form.addEventListener('submit', event => { event.preventDefault(); render(); });
next.addEventListener('click', () => controller?.next());
window.addEventListener('pagehide', () => controller?.destroy(), { once: true });
render();
