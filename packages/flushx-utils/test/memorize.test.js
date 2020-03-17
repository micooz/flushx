import { memorize } from '../src/memorize';

describe('memorize', () => {
  test('should always return 1', () => {
    const memo = memorize();
    expect(memo(() => 1, [''])).toBe(1);
    expect(memo(() => 2, [''])).toBe(1);
  });

  test('should first return 1 then 2', () => {
    const memo = memorize();
    expect(memo(() => 1, [''])).toBe(1);
    expect(memo(() => 2, ['x', 'a'])).toBe(2);
  });
});
