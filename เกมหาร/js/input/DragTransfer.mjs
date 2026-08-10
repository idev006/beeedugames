export function transferFruitIds(dataTransfer) {
  const fruitId = dataTransfer.getData('text/plain');
  try {
    const ids = JSON.parse(dataTransfer.getData('application/x-orchard-fruit-ids') || '[]');
    return ids.length ? ids : [fruitId].filter(Boolean);
  } catch {
    return [fruitId].filter(Boolean);
  }
}
