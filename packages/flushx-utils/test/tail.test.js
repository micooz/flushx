import * as path from 'path';
import { tail, TFMode } from '../src/tail';

const file = path.join(__dirname, 'fixtures', 'tail.txt');

describe('tail', () => {
  test('tail -n 0', () => {
    expect(() => tail(file, { mode: TFMode.N, n: 0 })).toThrow();
  });

  test('tail -n 1', () => {
    tail(file, { mode: TFMode.N, n: 1 }, lines => {
      expect(lines).toEqual([ '9' ]);
    });
  });

  test('tail -n 3', () => {
    tail(file, { mode: TFMode.N, n: 3 }, lines => {
      expect(lines).toEqual([ '456', '78', '9' ]);
    });
  });

  test('tail -n 10', () => {
    tail(file, { mode: TFMode.N, n: 10 }, lines => {
      expect(lines).toEqual([ '1', '23', '456', '78', '9' ]);
    });
  });

  test('tail close', () => {
    const handle = tail(file, { mode: TFMode.N, n: 10 }, lines => {
      expect(lines).toEqual([ '1', '23', '456', '78', '9' ]);
    });
    handle.close();
  });
});
