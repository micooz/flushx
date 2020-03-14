import getDateMaskRegexp from '../../src/utils/get-date-mask-regexp';

describe('getDateMaskRegexp', () => {
  test('a preset', () => {
    expect(getDateMaskRegexp('ISO8601')).toEqual(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
  });

  test('not a preset', () => {
    expect(getDateMaskRegexp('abc')).toEqual(/abc/);
  });
});
