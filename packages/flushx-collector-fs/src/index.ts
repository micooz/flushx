import * as fs from 'fs';
import * as path from 'path';
import { watch, FSWatcher } from 'chokidar';
import { Context, ICollectorPlugin, PluginConfig, CollectorPluginExecuteInput } from 'flushx';
import { memorize, tail, TFHandle, TFMode, LineDecoder, MemorizeFn } from 'flushx-utils';

// eslint-disable-next-line
const useMemo: MemorizeFn<any> = memorize();

/**
 * 文件数据读取器
 */
export default class FsCollectorPlugin implements ICollectorPlugin {

  private config: FsCollectorPluginConfig;

  private tailfHandler: TFHandle;

  private fsWatcher: FSWatcher;

  async init(config: FsCollectorPluginConfig): Promise<void> {
    const { file, mode } = config;

    if (!file) {
      throw Error('file must be set');
    }

    this.config = config;
    this.config.mode = mode || ReadMode.CONTINUOUS;

    const files = this.getFiles();
    if (files.length < 1) {
      throw Error(`no file(s) match "${file}"`);
    }

    // type check
    for (const file of files) {
      const stat = fs.statSync(file);
      if (!stat.isFile()) {
        throw Error(`"${file}" must be a FILE`);
      }
    }

    if (mode && !Object.values(ReadMode).includes(mode)) {
      throw Error(`unknown mode: "${mode}"`);
    }
  }

  async dispose(): Promise<void> {
    if (this.tailfHandler) {
      await this.tailfHandler.close();
      this.tailfHandler = null;
    }
    if (this.fsWatcher) {
      await this.fsWatcher.close();
      this.fsWatcher = null;
    }
  }

  execute(_ctx: Context, input: CollectorPluginExecuteInput): void {
    const { mode = ReadMode.CONTINUOUS } = this.config;

    function emit(lines: string[]): void {
      input.onData({ data: lines });
    }

    function tailf(filePath: string): TFHandle {
      return tail(filePath, { encoding: 'utf8', mode: TFMode.F }, emit);
    }

    const files = this.getFiles();

    if (mode === ReadMode.CONTINUOUS) {
      if (this.tailfHandler || this.fsWatcher) {
        return;
      }
      const mask = this.getRotationMask();
      const directory = this.getDirectory();

      if (mask) {
        this.fsWatcher = watch(directory, { depth: 1 });

        this.fsWatcher.on('add', filename => {
          if (!this.isFileMatchMask(filename, mask)) {
            return;
          }
          const fullPath = path.join(directory, filename);
          this.tailfHandler.close();
          this.tailfHandler = tailf(fullPath);
        });
      }

      this.tailfHandler = tailf(files[0]);
      return;
    }

    if (mode === ReadMode.ONE_TIME) {
      const decoder = new LineDecoder('utf8', '\n');
      decoder.on('lines', emit);

      for (const file of files) {
        const data = fs.readFileSync(file);
        decoder.put(data);
      }
    }
  }

  private getRotationMask(): string {
    const { file } = this.config;
    return useMemo(() => {
      const maskMatchArray = file.match(/\{(.*)\}$/);
      // e.g, YYYY-MM-DD
      return maskMatchArray ? maskMatchArray[1] : null;
    }, [file], 'getRotationMask');
  }

  private getDirectory(): string {
    const { file } = this.config;
    return path.dirname(
      path.isAbsolute(file) ? file : path.join(process.cwd(), file)
    );
  }

  private getFiles(): string[] {
    const { file } = this.config;
    const mask = this.getRotationMask();

    let files = [];

    if (mask) {
      const dir = this.getDirectory();

      files = fs.readdirSync(dir)
        .filter(name => this.isFileMatchMask(name, mask))
        .map(name => path.join(dir, name));
    } else {
      files.push(file);
    }

    // sort by modified time
    return [...files].sort((a: string, b: string) => {
      const { mtime: amtime } = fs.statSync(a);
      const { mtime: bmtime } = fs.statSync(b);
      return bmtime.getTime() - amtime.getTime();
    });
  }

  private isFileMatchMask(filename: string, mask: string): boolean {
    const { config: { file } } = this;

    const { name, regexp } = useMemo(() => {
      const name = path.basename(file, `.{${mask}}`);
      const regexp = new RegExp(mask.replace(/\w/g, '\\d') + '$');
      return { name, regexp };
    }, [file, mask], 'isFileMatchMask');

    if (!filename.startsWith(name)) {
      return false;
    }

    // must match rotation mask
    if (!filename.match(regexp)) {
      return false;
    }

    return true;
  }

}

/**
 * 配置项
 */
export interface FsCollectorPluginConfig extends PluginConfig {
  /**
   * 文件路径
   */
  file: string;

  /**
   * 读取方式
   */
  mode?: ReadMode;
}

/**
 * 文件读取模式
 */
export enum ReadMode {
  // 一次性读取
  ONE_TIME = 'one_time',
  // 连续读取
  CONTINUOUS = 'continuous',
}
