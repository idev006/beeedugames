export function resetSelectionBox(box) {
  Object.assign(box, { active: false, left: 0, top: 0, width: 0, height: 0 });
}

export function updateSelectionBoxFromPointer(box, start, event) {
  const { x, y, bounds } = start;
  const left = Math.max(0, Math.min(x, event.clientX) - bounds.left);
  const top = Math.max(0, Math.min(y, event.clientY) - bounds.top);
  const right = Math.min(bounds.width, Math.max(x, event.clientX) - bounds.left);
  const bottom = Math.min(bounds.height, Math.max(y, event.clientY) - bounds.top);
  Object.assign(box, { left, top, width: Math.max(0, right - left), height: Math.max(0, bottom - top) });
}

export function fruitIdsInsideSelection(root, bounds, box) {
  const area = { left: box.left, top: box.top, right: box.left + box.width, bottom: box.top + box.height };
  return [...root.querySelectorAll('.fruit')]
    .filter((element) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2 - bounds.left;
      const centerY = rect.top + rect.height / 2 - bounds.top;
      return centerX >= area.left && centerX <= area.right && centerY >= area.top && centerY <= area.bottom;
    })
    .flatMap((element) => JSON.parse(element.dataset.fruitIds || JSON.stringify([element.dataset.fruitId])));
}
