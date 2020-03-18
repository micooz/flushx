import { memorize } from '../src/memorize';

describe('memorize', () => {
  test('should always return 1', () => {
    const useMemo = memorize();
    expect(useMemo(() => 1, [''], 'abc')).toBe(1);
    expect(useMemo(() => 2, [''], 'abc')).toBe(1);
  });

  test('should first return 1 then 2', () => {
    const useMemo = memorize();
    expect(useMemo(() => 1, [''], 'abc')).toBe(1);
    expect(useMemo(() => 2, ['x'], 'abc')).toBe(2);
  });

  test('called with different key', () => {
    const useMemo = memorize();
    expect(useMemo(() => 1, [''], 'abc')).toBe(1);
    expect(useMemo(() => 2, [''], 'dfe')).toBe(2);
  });
});
