export function bundleSizeFor(count) {
  if (count >= 10) return 10;
  if (count >= 5) return 5;
  return 1;
}

// Uniform grouping contract for every pile (source tray and baskets alike):
// whenever a pile holds 5 or more fruits, form as many 10-value tokens as
// possible, then one 5-value token for any remainder of at least 5, and
// leave a smaller remainder as individual single fruits.
// expandedFruitIds force those fruits to render as single fruits (cap 1);
// fiveUnitFruitIds force those fruits into 5-value tokens only (cap 5),
// so a double-clicked 10-token renders as two 5-tokens instead of ten singles.
export function fruitBundles(fruits, expandedFruitIds = [], fiveUnitFruitIds = []) {
  const expanded = new Set(expandedFruitIds);
  const fiveUnit = new Set(fiveUnitFruitIds);
  const capOf = (fruit) => (expanded.has(fruit.id) ? 1 : fiveUnit.has(fruit.id) ? 5 : 10);
  const groupable = fruits.length >= 5;
  const bundles = [];
  let index = 0;
  while (index < fruits.length) {
    const remaining = fruits.length - index;
    let size;
    if (expanded.has(fruits[index].id) || !groupable) size = 1;
    else if (remaining >= 10) size = 10;
    else if (remaining >= 5) size = 5;
    else size = 1;
    size = Math.min(size, capOf(fruits[index]));
    const group = [];
    while (index < fruits.length && group.length < size && capOf(fruits[index]) >= size) group.push(fruits[index++]);
    bundles.push({
      id: group.map((fruit) => fruit.id).join('+'),
      ids: group.map((fruit) => fruit.id),
      value: group.length,
      objectType: group[0]?.objectType ?? 'apple',
    });
  }
  return bundles;
}
