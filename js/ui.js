import { getFrames, reorderFrames, setStartingFrame, removeFrame } from './frames.js';

/**
 * Re-render the frame strip.
 * onChange() is called whenever the frame list changes.
 */
export function renderFrameStrip(onChange) {
  const strip = document.getElementById('frame-strip');
  strip.innerHTML = '';
  const frames = getFrames();

  frames.forEach((frame, index) => {
    const item = document.createElement('div');
    item.className = 'frame-item' + (index === 0 ? ' is-first' : '');
    item.draggable = true;
    item.dataset.index = String(index);
    item.setAttribute('role', 'listitem');

    item.innerHTML = `
      <img src="${frame.img}" alt="Frame ${index + 1}">
      <div class="frame-label">
        Frame ${index + 1}
        ${index === 0 ? '<span class="badge">first</span>' : ''}
      </div>
      <div class="frame-actions">
        ${index > 0 ? '<button class="frame-btn set-first" title="Set as Starting Frame">↑ Set first</button>' : ''}
        <button class="frame-btn remove" title="Remove frame">✕</button>
      </div>
    `;

    // ── Drag & drop ──────────────────────────────
    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
      setTimeout(() => item.classList.add('dragging'), 0);
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      strip.querySelectorAll('.frame-item').forEach(el => el.classList.remove('drag-over'));
    });
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      strip.querySelectorAll('.frame-item').forEach(el => el.classList.remove('drag-over'));
      item.classList.add('drag-over');
    });
    item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.classList.remove('drag-over');
      const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
      const to   = parseInt(item.dataset.index, 10);
      if (from !== to) {
        reorderFrames(from, to);
        renderFrameStrip(onChange);
        onChange();
      }
    });

    // ── Set first ────────────────────────────────
    const setFirstBtn = item.querySelector('.set-first');
    if (setFirstBtn) {
      setFirstBtn.addEventListener('click', () => {
        setStartingFrame(frame.id);
        renderFrameStrip(onChange);
        onChange();
      });
    }

    // ── Remove ───────────────────────────────────
    item.querySelector('.remove').addEventListener('click', () => {
      removeFrame(frame.id);
      renderFrameStrip(onChange);
      onChange();
    });

    strip.appendChild(item);
  });
}
