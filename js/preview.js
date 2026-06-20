let timerId = null;

/**
 * Start the live preview animation.
 *
 * Draws compositeCanvas to the preview canvas, then overlays a sliding
 * Barrier Grid pattern. The grid slides 1 pixel per step so each frame is
 * visible for (stripeWidth × stepMs) ms.
 */
export function startPreview(compositeCanvas, numFrames, direction, stripeWidth) {
  stopPreview();

  const canvas = document.getElementById('preview-canvas');
  const ctx    = canvas.getContext('2d');
  canvas.width  = compositeCanvas.width;
  canvas.height = compositeCanvas.height;

  const period = numFrames * stripeWidth;
  const w = canvas.width;
  const h = canvas.height;

  // Build a 1-px tile representing one period of the barrier pattern.
  // Transparent at positions 0..stripeWidth-1, opaque black afterwards.
  const tile = document.createElement('canvas');
  const isColumns = direction === 'columns';
  tile.width  = isColumns ? period : 1;
  tile.height = isColumns ? 1 : period;
  const tileCtx = tile.getContext('2d');
  tileCtx.fillStyle = '#000';
  if (isColumns) {
    tileCtx.fillRect(stripeWidth, 0, period - stripeWidth, 1);
  } else {
    tileCtx.fillRect(0, stripeWidth, 1, period - stripeWidth);
  }
  const pattern = ctx.createPattern(tile, 'repeat');

  // Step rate: slow enough to see each frame clearly.
  const stepMs = Math.max(20, Math.round(600 / period));
  let offset = 0;

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(compositeCanvas, 0, 0);

    // Shift the repeating barrier pattern by `offset` pixels.
    const matrix = new DOMMatrix();
    if (isColumns) {
      matrix.translateSelf(offset, 0);
    } else {
      matrix.translateSelf(0, offset);
    }
    pattern.setTransform(matrix);

    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, w, h);

    offset = (offset + 1) % period;
    timerId = setTimeout(draw, stepMs);
  }

  draw();
}

export function stopPreview() {
  if (timerId !== null) {
    clearTimeout(timerId);
    timerId = null;
  }
}
