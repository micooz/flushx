import { fitToRange } from '../src/fit-to-range';

describe('fitToRange', () => {
  const range = { min: 10, max: 20 };

  test('lower than min', () => {
    expect(fitToRange(1, range)).toBe(10);
  });

  test('greater than max', () => {
    expect(fitToRange(30, range)).toBe(20);
  });

  test('normal', () => {
    expect(fitToRange(15, range)).toBe(15);
  });
});
