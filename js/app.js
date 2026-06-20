import { getFrames } from './frames.js';
import { initUpload } from './upload.js';
import { renderFrameStrip } from './ui.js';
import { generateComposite, generateBarrierGrid } from './generate.js';
import { startPreview, stopPreview } from './preview.js';

const MIN_FRAMES = 2;

// ── DOM refs ────────────────────────────────────
const framesSection  = document.getElementById('frames-section');
const settingsSection = document.getElementById('settings-section');
const generateBar    = document.getElementById('generate-bar');
const generateBtn    = document.getElementById('generate-btn');
const outputSection  = document.getElementById('output-section');
const previewSection = document.getElementById('preview-section');
const resizeWarning  = document.getElementById('resize-warning');
const compositeCanvas = document.getElementById('composite-canvas');
const barrierCanvas  = document.getElementById('barrier-canvas');
const downloadComposite = document.getElementById('download-composite');
const downloadBarrier   = document.getElementById('download-barrier');
const directionSelect   = document.getElementById('direction-select');
const stripeWidthInput  = document.getElementById('stripe-width-input');

// ── Upload ──────────────────────────────────────
initUpload(({ hadResize }) => {
  resizeWarning.hidden = !hadResize;
  onFramesChanged();
});

// ── Frame strip changes ─────────────────────────
function onFramesChanged() {
  const frames = getFrames();
  const enough = frames.length >= MIN_FRAMES;

  framesSection.hidden   = frames.length === 0;
  settingsSection.hidden = !enough;
  generateBar.hidden     = !enough;
  generateBtn.disabled   = !enough;

  // Invalidate outputs whenever frames change.
  outputSection.hidden  = true;
  previewSection.hidden = true;
  stopPreview();

  renderFrameStrip(onFramesChanged);
}

// ── Generate ────────────────────────────────────
generateBtn.addEventListener('click', () => {
  const frames = getFrames();
  if (frames.length < MIN_FRAMES) return;

  const direction  = directionSelect.value;
  const stripeWidth = Math.max(1, parseInt(stripeWidthInput.value, 10) || 3);

  const composite = generateComposite(frames, direction, stripeWidth);
  const barrier   = generateBarrierGrid(
    frames[0].width, frames[0].height,
    frames.length, direction, stripeWidth
  );

  // Render composite preview
  compositeCanvas.width  = composite.width;
  compositeCanvas.height = composite.height;
  compositeCanvas.getContext('2d').drawImage(composite, 0, 0);

  // Render barrier grid preview
  barrierCanvas.width  = barrier.width;
  barrierCanvas.height = barrier.height;
  barrierCanvas.getContext('2d').drawImage(barrier, 0, 0);

  // Wire download links
  downloadComposite.href = composite.toDataURL('image/png');
  downloadBarrier.href   = barrier.toDataURL('image/png');

  outputSection.hidden  = false;
  previewSection.hidden = false;

  startPreview(composite, frames.length, direction, stripeWidth);
});
