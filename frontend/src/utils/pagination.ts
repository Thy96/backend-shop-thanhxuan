export function getPaginationRange(
  current: number,
  total: number,
  delta = 1
): (number | '...')[] {
  const range: (number | '...')[] = [];

  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);

  if (left > 2) {
    range.push('...');
  }

  for (let i = left; i <= right; i++) {
    range.push(i);
  }

  if (right < total - 1) {
    range.push('...');
  }

  range.push(total);

  return range;
}
