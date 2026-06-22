let cleanup = null;

/**
 * Render an interactive preview on a single canvas.
 * The composite is drawn first; the Barrier Grid is drawn on top at the
 * current drag offset so its transparency reveals one frame at a time.
 */
export function startPreview(compositeCanvas, barrierCanvas, direction) {
  stopPreview();

  const container = document.getElementById('preview-container');
  const hint      = document.getElementById('preview-hint');
  container.innerHTML = '';

  const isColumns = direction === 'columns';
  const compW = compositeCanvas.width;
  const compH = compositeCanvas.height;
  const maxOffset = isColumns
    ? barrierCanvas.width  - compW
    : barrierCanvas.height - compH;

  // Single canvas sized to the composite
  const canvas = document.createElement('canvas');
  canvas.width  = compW;
  canvas.height = compH;
  canvas.style.display  = 'block';
  canvas.style.maxWidth = '100%';
  canvas.style.height   = 'auto';
  canvas.style.cursor   = 'grab';
  canvas.style.borderRadius = '6px';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let offset = 0;

  function draw() {
    ctx.clearRect(0, 0, compW, compH);
    ctx.drawImage(compositeCanvas, 0, 0);
    // Draw barrier shifted right/down by offset; its transparency reveals the composite
    ctx.drawImage(barrierCanvas, isColumns ? offset : 0, isColumns ? 0 : offset);
  }

  draw();

  hint.textContent = isColumns
    ? '← Drag left or right to animate →'
    : '↑ Drag up or down to animate ↓';

  // ── Drag ─────────────────────────────────────
  let dragging  = false;
  let dragStart = 0;

  function scaleOf() {
    // Account for CSS scaling (max-width: 100%)
    return isColumns
      ? compW / canvas.getBoundingClientRect().width
      : compH / canvas.getBoundingClientRect().height;
  }

  function clientPrimary(e) {
    return isColumns ? e.clientX : e.clientY;
  }

  function onStart(primary) {
    dragging  = true;
    dragStart = primary - offset / scaleOf();
    canvas.style.cursor = 'grabbing';
  }

  function onMove(primary) {
    if (!dragging) return;
    const newOffset = (primary - dragStart) * scaleOf();
    offset = Math.max(0, Math.min(maxOffset, newOffset));
    draw();
  }

  function onEnd() {
    dragging = false;
    canvas.style.cursor = 'grab';
  }

  const onMouseDown  = (e) => onStart(clientPrimary(e));
  const onMouseMove  = (e) => onMove(clientPrimary(e));
  const onTouchStart = (e) => { e.preventDefault(); onStart(isColumns ? e.touches[0].clientX : e.touches[0].clientY); };
  const onTouchMove  = (e) => { e.preventDefault(); onMove(isColumns  ? e.touches[0].clientX : e.touches[0].clientY); };

  canvas.addEventListener('mousedown',  onMouseDown);
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  window.addEventListener('mousemove',  onMouseMove);
  window.addEventListener('mouseup',    onEnd);
  window.addEventListener('touchmove',  onTouchMove,  { passive: false });
  window.addEventListener('touchend',   onEnd);

  cleanup = () => {
    canvas.removeEventListener('mousedown',  onMouseDown);
    canvas.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('mousemove',  onMouseMove);
    window.removeEventListener('mouseup',    onEnd);
    window.removeEventListener('touchmove',  onTouchMove);
    window.removeEventListener('touchend',   onEnd);
  };
}

export function stopPreview() {
  if (cleanup) { cleanup(); cleanup = null; }
  const container = document.getElementById('preview-container');
  if (container) container.innerHTML = '';
}
