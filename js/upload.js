import { addFrame, clearFrames } from './frames.js';

const MIN_FRAMES = 2;
const MAX_FRAMES = 5;

/**
 * Wire up the upload drop-zone and file input.
 * Calls onFramesReady({ hadResize }) when frames are ready.
 */
export function initUpload(onFramesReady) {
  const fileInput = document.getElementById('file-input');
  const dropZone  = document.getElementById('drop-zone');

  dropZone.addEventListener('click', (e) => {
    if (!e.target.closest('label')) fileInput.click();
  });
  dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') fileInput.click();
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFiles(Array.from(e.dataTransfer.files), onFramesReady);
  });

  fileInput.addEventListener('change', () => {
    handleFiles(Array.from(fileInput.files), onFramesReady);
    fileInput.value = '';
  });
}

async function handleFiles(files, onFramesReady) {
  if (!files.length) return;
  clearError();

  if (files.length === 1 && files[0].type === 'image/gif') {
    await handleGif(files[0], onFramesReady);
    return;
  }

  const imageFiles = files
    .filter(f => f.type.startsWith('image/') && f.type !== 'image/gif')
    .slice(0, MAX_FRAMES);

  if (imageFiles.length < MIN_FRAMES) {
    showError(`Please upload at least ${MIN_FRAMES} image files.`);
    return;
  }

  clearFrames();
  const loaded = await Promise.all(imageFiles.map(loadImageFile));

  const targetW = loaded[0].width;
  const targetH = loaded[0].height;
  let hadResize = false;

  for (const frame of loaded) {
    if (frame.width !== targetW || frame.height !== targetH) {
      resizeToTarget(frame, targetW, targetH);
      hadResize = true;
    }
    addFrame(frame);
  }

  onFramesReady({ hadResize });
}

async function handleGif(file, onFramesReady) {
  if (typeof GifReader === 'undefined') {
    showError('GIF parsing library not loaded. Check your internet connection.');
    return;
  }

  const buffer = await file.arrayBuffer();
  let reader;
  try {
    reader = new GifReader(new Uint8Array(buffer));
  } catch {
    showError('Could not parse the GIF file.');
    return;
  }

  const total = reader.numFrames();
  if (total < MIN_FRAMES) {
    showError(`GIF has only ${total} frame(s). At least ${MIN_FRAMES} are needed.`);
    return;
  }

  const count = Math.min(total, MAX_FRAMES);
  const w = reader.width;
  const h = reader.height;

  clearFrames();
  for (let i = 0; i < count; i++) {
    const imageData = new ImageData(w, h);
    reader.decodeAndBlitFrameRGBA(i, imageData.data);

    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').putImageData(imageData, 0, 0);

    addFrame({ img: canvas.toDataURL(), imageData, width: w, height: h, name: `Frame ${i + 1}` });
  }

  onFramesReady({ hadResize: false });
}

function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve({
        img: canvas.toDataURL(),
        imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
        width: img.naturalWidth,
        height: img.naturalHeight,
        name: file.name,
      });
    };
    img.onerror = reject;
    img.src = url;
  });
}

function resizeToTarget(frame, targetW, targetH) {
  const src = document.createElement('canvas');
  src.width = frame.width; src.height = frame.height;
  src.getContext('2d').putImageData(frame.imageData, 0, 0);

  const dst = document.createElement('canvas');
  dst.width = targetW; dst.height = targetH;
  const ctx = dst.getContext('2d');

  const scale = Math.min(targetW / frame.width, targetH / frame.height);
  const sw = frame.width * scale;
  const sh = frame.height * scale;
  const ox = (targetW - sw) / 2;
  const oy = (targetH - sh) / 2;

  ctx.drawImage(src, ox, oy, sw, sh);

  frame.img = dst.toDataURL();
  frame.imageData = ctx.getImageData(0, 0, targetW, targetH);
  frame.width = targetW;
  frame.height = targetH;
}

function showError(msg) {
  const el = document.getElementById('upload-error');
  el.textContent = msg;
  el.hidden = false;
}

function clearError() {
  document.getElementById('upload-error').hidden = true;
}
