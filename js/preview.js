let cleanup = null;

/**
 * Render an interactive preview: composite image with the Barrier Grid
 * overlaid and draggable in the slide direction.
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

  // ── Composite (static base) ──────────────────
  const compEl = document.createElement('canvas');
  compEl.width  = compW;
  compEl.height = compH;
  compEl.getContext('2d').drawImage(compositeCanvas, 0, 0);
  compEl.style.display = 'block';

  // ── Barrier grid (draggable overlay) ─────────
  const barEl = document.createElement('canvas');
  barEl.width  = barrierCanvas.width;
  barEl.height = barrierCanvas.height;
  barEl.getContext('2d').drawImage(barrierCanvas, 0, 0);
  barEl.style.position = 'absolute';
  barEl.style.top      = '0';
  barEl.style.left     = '0';
  barEl.style.pointerEvents = 'none';

  // ── Wrapper sized to the composite ───────────
  const wrap = document.createElement('div');
  wrap.style.position = 'relative';
  wrap.style.display  = 'inline-block';
  wrap.style.cursor   = 'grab';
  wrap.style.userSelect = 'none';
  wrap.style.maxWidth = '100%';
  wrap.appendChild(compEl);
  wrap.appendChild(barEl);
  container.appendChild(wrap);

  hint.textContent = isColumns
    ? '← Drag left or right to animate →'
    : '↑ Drag up or down to animate ↓';

  // ── Drag state ───────────────────────────────
  let dragging  = false;
  let dragStart = 0;
  let offset    = 0;

  function applyOffset(px) {
    offset = Math.max(0, Math.min(maxOffset, px));
    barEl.style.left = isColumns ? `${offset}px` : '0';
    barEl.style.top  = isColumns ? '0' : `${offset}px`;
  }

  function onStart(primary) {
    dragging  = true;
    dragStart = primary - offset;
    wrap.style.cursor = 'grabbing';
  }

  function onMove(primary) {
    if (!dragging) return;
    applyOffset(primary - dragStart);
  }

  function onEnd() {
    dragging = false;
    wrap.style.cursor = 'grab';
  }

  // Mouse
  const onMouseDown  = (e) => onStart(isColumns ? e.clientX : e.clientY);
  const onMouseMove  = (e) => onMove(isColumns  ? e.clientX : e.clientY);

  // Touch
  const onTouchStart = (e) => { e.preventDefault(); onStart(isColumns ? e.touches[0].clientX : e.touches[0].clientY); };
  const onTouchMove  = (e) => { e.preventDefault(); onMove(isColumns  ? e.touches[0].clientX : e.touches[0].clientY); };

  wrap.addEventListener('mousedown',  onMouseDown);
  wrap.addEventListener('touchstart', onTouchStart, { passive: false });
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup',   onEnd);
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend',  onEnd);

  cleanup = () => {
    wrap.removeEventListener('mousedown',  onMouseDown);
    wrap.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup',   onEnd);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend',  onEnd);
  };
}

export function stopPreview() {
  if (cleanup) { cleanup(); cleanup = null; }
  const container = document.getElementById('preview-container');
  if (container) container.innerHTML = '';
}
