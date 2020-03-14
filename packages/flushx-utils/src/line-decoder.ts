import { EventEmitter } from 'events';

export class LineDecoder extends EventEmitter {

  buf = Buffer.alloc(0);

  static events = {
    LINES: 'lines',
  };

  private readonly encoding: string;

  private readonly delimiter: string;

  constructor(encoding = 'utf8', delimiter = '\n') {
    super();
    this.encoding = encoding;
    this.delimiter = delimiter;
  }

  put(buf: Buffer): void {
    this.buf = Buffer.concat([ this.buf, buf ]);

    const lines: Buffer[] = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const index = this.buf.indexOf(this.delimiter);
      if (index < 0) {
        break;
      }
      lines.push(this.buf.slice(0, index));
      this.buf = this.buf.slice(index + 1);
    }

    if (lines.length > 0) {
      this.emit(LineDecoder.events.LINES, lines.map(line => line.toString(this.encoding)));
    }
  }

}
