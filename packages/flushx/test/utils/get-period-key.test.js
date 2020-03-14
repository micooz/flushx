import { ProcessPeriod } from '../../src/config';
import getPeriodKey from '../../src/utils/get-period-key';

describe('getPeriodKey', () => {
  const date = new Date(1582861382764);

  test('by hour', () => {
    expect(getPeriodKey(date, ProcessPeriod.HOUR)).toBe(1582858800000);
  });

  test('by minute', () => {
    expect(getPeriodKey(date, ProcessPeriod.MINUTE)).toBe(1582861380000);
  });

  test('by second', () => {
    expect(getPeriodKey(date, ProcessPeriod.SECOND)).toBe(1582861382000);
  });

  test('by unknown period', () => {
    expect(() => getPeriodKey(date, null)).toThrowError('unknown period: null');
  });
});
