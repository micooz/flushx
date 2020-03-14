export function fitToRange(num: number, range: Range): number {
  const { min, max } = range;
  if (num < min) {
    return min;
  }
  if (num > max) {
    return max;
  }
  return num;
}

export interface Range {
  min: number;
  max: number;
}
