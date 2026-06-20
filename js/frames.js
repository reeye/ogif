/**
 * Frame state.
 * A Frame: { id, img, imageData, width, height, name }
 */

let frames = [];
let nextId = 0;

export function getFrames() { return frames; }

export function addFrame(frame) {
  frame.id = nextId++;
  frames.push(frame);
}

export function removeFrame(id) {
  frames = frames.filter(f => f.id !== id);
}

export function reorderFrames(fromIndex, toIndex) {
  const [item] = frames.splice(fromIndex, 1);
  frames.splice(toIndex, 0, item);
}

/** Move the frame with the given id to position 0 (Starting Frame). */
export function setStartingFrame(id) {
  const index = frames.findIndex(f => f.id === id);
  if (index <= 0) return;
  const [item] = frames.splice(index, 1);
  frames.unshift(item);
}

export function clearFrames() {
  frames = [];
  nextId = 0;
}
