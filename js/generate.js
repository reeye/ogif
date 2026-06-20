/**
 * Generate the Composite Image by interleaving frame Stripes.
 *
 * For columns: column x belongs to frame floor(x / stripeWidth) % numFrames.
 * For rows:    row y    belongs to frame floor(y / stripeWidth) % numFrames.
 *
 * Returns an HTMLCanvasElement.
 */
export function generateComposite(frames, direction, stripeWidth) {
  const w = frames[0].width;
  const h = frames[0].height;
  const n = frames.length;

  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  const out = ctx.createImageData(w, h);
  const d = out.data;

  if (direction === 'columns') {
    for (let x = 0; x < w; x++) {
      const src = frames[Math.floor(x / stripeWidth) % n].imageData.data;
      for (let y = 0; y < h; y++) {
        const i = (y * w + x) * 4;
        d[i]   = src[i];
        d[i+1] = src[i+1];
        d[i+2] = src[i+2];
        d[i+3] = src[i+3];
      }
    }
  } else {
    for (let y = 0; y < h; y++) {
      const src = frames[Math.floor(y / stripeWidth) % n].imageData.data;
      const row = y * w * 4;
      for (let x = 0; x < w; x++) {
        const i = row + x * 4;
        d[i]   = src[i];
        d[i+1] = src[i+1];
        d[i+2] = src[i+2];
        d[i+3] = src[i+3];
      }
    }
  }

  ctx.putImageData(out, 0, 0);
  return canvas;
}

/**
 * Generate the Barrier Grid PNG.
 *
 * The pattern has a period of (numFrames × stripeWidth) pixels.
 * Positions 0..stripeWidth-1 within each period are transparent (the "window").
 * The rest are opaque black.
 *
 * Returns an HTMLCanvasElement (same dimensions as the composite).
 */
export function generateBarrierGrid(width, height, numFrames, direction, stripeWidth) {
  const period = numFrames * stripeWidth;
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  const out = ctx.createImageData(width, height);
  const d = out.data;

  if (direction === 'columns') {
    for (let x = 0; x < width; x++) {
      if (x % period >= stripeWidth) {
        for (let y = 0; y < height; y++) {
          d[(y * width + x) * 4 + 3] = 255;
        }
      }
    }
  } else {
    for (let y = 0; y < height; y++) {
      if (y % period >= stripeWidth) {
        const row = y * width * 4;
        for (let x = 0; x < width; x++) {
          d[row + x * 4 + 3] = 255;
        }
      }
    }
  }

  ctx.putImageData(out, 0, 0);
  return canvas;
}
