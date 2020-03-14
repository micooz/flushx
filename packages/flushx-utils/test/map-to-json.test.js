import { mapToJson } from '../src/map-to-json';

describe('mapToJson', () => {
  test('empty map', () => {
    expect(mapToJson(new Map())).toEqual({});
  });

  test('non-empty map', () => {
    const map = new Map();
    map.set('foo', 'bar');
    expect(mapToJson(map)).toEqual({ foo: 'bar' });
  });
});
