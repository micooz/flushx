import * as fs from 'fs';
import * as debounce from 'debounce';
import { watch, FSWatcher } from 'chokidar';
import { LineDecoder } from './line-decoder';
import { fitToRange } from './fit-to-range';

/**
 * function like unix tail command
 * @param file
 * @param options
 * @param cb
 */
export function tail(file: string, options: TFOptions, cb: TFCallback): TFHandle {
  const encoding = options.encoding || 'utf8';
  const delimiter = options.delimiter || '\n';
  const mode = options.mode || TFMode.F;
  const n = options.n;

  if (mode === TFMode.N && !n) {
    throw Error('n should be specified when mode is TFMode.N');
  }

  const range = { min: 1024, max: 10 * 1024 * 1024 };
  const initBufferSize = fitToRange(options.initBufferSize || range.min, range);
  const maxBufferSize = fitToRange(options.maxBufferSize || range.max, range);

  // 打开文件准备读取
  const fd = fs.openSync(file, 'r');
  const stat = fs.statSync(file);

  // 移动到文件末尾读取
  let pos = stat.size;

  // 创建一个共享的缓冲区，每次读取内容写在这里，
  // 并根据情况适当扩充，可以防止频繁地申请新的内存
  let sharedBuffer = Buffer.alloc(initBufferSize);

  const decoder = new LineDecoder(encoding, delimiter);
  decoder.on(LineDecoder.events.LINES, cb);

  function getBuffer(len?: number): Buffer {
    // 如果需要的空间比当前已有的大，那么重新申请一个
    if (len && len > sharedBuffer.length) {
      sharedBuffer = Buffer.alloc(len);
    }
    return sharedBuffer;
  }

  function readToEnd(): Buffer | null {
    // 获取当前文件总长度
    const { size } = fs.statSync(file);

    // 计算本次应该读取的增量
    const len = size - pos;

    // 出现负数的话意味着文件缩短了，将指针重置到末尾
    if (len < 1) {
      pos = size;
      return null;
    }

    // 如果本次要读入的数据量超过了缓冲区的上限，
    // 做循环读取，以降低内存消耗
    const iters = Math.ceil(len / maxBufferSize);
    const readLen = iters === 1 ? len : maxBufferSize;
    const chunks: Buffer[] = [];

    for (let i = 0; i < iters; i++) {
      const buffer = getBuffer(readLen);

      // 读入数据到缓冲区
      const offset = 0;
      const bytesRead = fs.readSync(
        fd,
        buffer, offset, readLen,
        pos
      );
      // 更新指针位置
      pos = pos + bytesRead;

      chunks.push(buffer.slice(offset, offset + bytesRead));
    }

    return Buffer.concat(chunks);
  }

  function readBackN(n: number): void {
    const readLen = sharedBuffer.length;

    // lines counter
    let k = 0;
    let wholeBuf = Buffer.alloc(0);

    tag: while (pos > 0 && k < n) {
      const bytesRead = fs.readSync(
        fd,
        sharedBuffer, 0, readLen,
        pos - readLen
      );
      const buf = sharedBuffer.slice(0, bytesRead);

      // count delimiter in buf
      let index = 0;
      let lastIndex = buf.length - 1;
      let offset = buf.length - 1;

      while ((index = buf.lastIndexOf(delimiter, offset)) !== -1) {
        k = k + 1;
        // already match requirement
        if (k > n) {
          wholeBuf = Buffer.concat([ buf.slice(index + 1), wholeBuf ]);
          break tag;
        }
        offset = offset - (lastIndex - index + 1);
        lastIndex = index;
      }

      // prepend to wholeBuf
      wholeBuf = Buffer.concat([ buf, wholeBuf ]);

      // update pos
      pos = pos - bytesRead;
    }

    decoder.put(wholeBuf);
  }

  let watcher: FSWatcher;

  // tail -f
  if (mode === TFMode.F) {
    // 做一个 debounce 以防止频繁调用
    const handleFileChange = debounce(() => {
      const buf = readToEnd();
      if (!buf) {
        return;
      }
      decoder.put(buf);
    }, 1000, true);

    watcher = watch(file);
    watcher.on('change', handleFileChange);
  }

  // tail -n
  if (mode === TFMode.N) {
    readBackN(n);
  }

  return {
    async close(): Promise<void> {
      decoder.removeListener(LineDecoder.events.LINES, cb);
      if (watcher) {
        await watcher.close();
      }
      fs.closeSync(fd);
    }
  }
}

export interface TFOptions {
  encoding?: string;
  delimiter?: string;
  mode?: TFMode;
  n?: number;
  initBufferSize?: number;
  maxBufferSize?: number;
}

export interface TFHandle {
  close(): Promise<void>;
}

export enum TFMode {
  F, // -f
  N, // -n
}

export type TFCallback = (lines: string[]) => void;
