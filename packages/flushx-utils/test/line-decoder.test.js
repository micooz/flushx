import { LineDecoder } from '../src/line-decoder';

describe('LineDecoder', () => {
  test('put empty buf', () => {
    const decoder = new LineDecoder();
    decoder.put(Buffer.alloc(0));

    expect(decoder.buf.length).toBe(0);
  });

  test('put one delimiter', () => {
    const decoder = new LineDecoder('utf8', '\n');
    const mockOnLines = jest.fn();

    decoder.on('lines', mockOnLines);
    decoder.put(Buffer.from('\n'));

    expect(mockOnLines.mock.calls[0][0]).toEqual([ '' ]);
    expect(decoder.buf.length).toBe(0);
  });

  test('put two delimiter', () => {
    const decoder = new LineDecoder('utf8', '\n');
    const mockOnLines = jest.fn();

    decoder.on('lines', mockOnLines);
    decoder.put(Buffer.from('\n\n'));

    expect(mockOnLines.mock.calls[0][0]).toEqual([ '', '' ]);
    expect(decoder.buf.length).toBe(0);
  });

  test('put some chars without delimiter', () => {
    const decoder = new LineDecoder('utf8', '\n');
    const mockOnLines = jest.fn();

    decoder.on('lines', mockOnLines);
    decoder.put(Buffer.from('abc'));

    expect(mockOnLines.mock.calls.length).toBe(0);
    expect(decoder.buf).toEqual(Buffer.from('abc'));
  });

  test('put some chars with delimiter', () => {
    const decoder = new LineDecoder('utf8', '\n');
    const mockOnLines = jest.fn();

    decoder.on('lines', mockOnLines);
    decoder.put(Buffer.from('abc\ndef\nghi'));

    expect(mockOnLines.mock.calls[0][0]).toEqual([ 'abc', 'def' ]);
    expect(decoder.buf).toEqual(Buffer.from('ghi'));
  });
});
