import { splitChunks } from '../src/split-chunks';

describe('splitChunks', () => {
  test('empty array should return empty array', () => {
    expect(splitChunks([], 2)).toEqual([]);
  });

  test('array length less than chunk size', () => {
    expect(splitChunks([ 1, 2 ], 10)).toEqual([ [ 1, 2 ] ]);
  });

  test('array should split into two chunks', () => {
    expect(splitChunks([ 1, 2, 3 ], 2)).toEqual([ [ 1, 2 ], [ 3 ] ]);
  });
});
