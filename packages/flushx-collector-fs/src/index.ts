import * as fs from 'fs';
import * as path from 'path';
import { Context, ICollectorPlugin, PluginConfig, CollectorPluginExecuteInput } from 'flushx';
import { memorize, tail, TFHandle, TFMode, LineDecoder, MemorizeFn } from 'flushx-utils';

/**
 * 文件数据读取器
 */
export default class FsCollectorPlugin implements ICollectorPlugin {

  private config: FsCollectorPluginConfig;

  // eslint-disable-next-line
  private memo: MemorizeFn<any>;

  private tailfHandler: TFHandle;

  private fsWatcher: fs.FSWatcher;

  private directory: string;

  private files: string[];

  private rotationMask: string;

  async init(config: FsCollectorPluginConfig): Promise<void> {
    const { file, mode } = config;

    if (!file) {
      throw Error('file must be set');
    }

    this.config = config;
    this.config.mode = mode || ReadMode.CONTINUOUS;
    this.memo = memorize();

    const maskMatchArray = file.match(/\{(.*)\}$/);
    if (maskMatchArray) {
      // e.g, YYYY-MM-DD
      this.rotationMask = maskMatchArray[1];
    }

    // find all files if rotation mask set
    if (this.rotationMask) {
      const dir = path.dirname(
        path.isAbsolute(file) ? file : path.join(process.cwd(), file)
      );

      const files = (await fs.promises.readdir(dir))
        .filter(this.isFileMatchMask.bind(this))
        .map(file => path.join(dir, file));

      if (files.length < 1) {
        throw Error(`no files match "${file}"`);
      }

      // sort by modified time
      this.files = [...files].sort((a: string, b: string) => {
        const { mtime: amtime } = fs.statSync(a);
        const { mtime: bmtime } = fs.statSync(b);
        return bmtime.getTime() - amtime.getTime();
      });

      this.directory = dir;
    } else {
      if (!fs.existsSync(file)) {
        throw Error(`"${file}" doesn't exists`);
      }
      this.files = [file];
    }

    // File type check
    for (const file of this.files) {
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
      this.tailfHandler.close();
      this.tailfHandler = null;
    }
    if (this.fsWatcher) {
      this.fsWatcher.close();
      this.fsWatcher = null;
    }
  }

  execute(_ctx: Context, input: CollectorPluginExecuteInput): void {
    const { files } = this;
    const { mode = ReadMode.CONTINUOUS } = this.config;

    function emit(lines: string[]): void {
      input.onData({ data: lines });
    }

    function tailf(filePath: string): TFHandle {
      return tail(filePath, { encoding: 'utf8', mode: TFMode.F }, emit);
    }

    if (mode === ReadMode.CONTINUOUS) {
      if (this.tailfHandler || this.fsWatcher) {
        return;
      }

      if (this.rotationMask && this.directory) {
        this.fsWatcher = fs.watch(this.directory, { encoding: 'utf8' }, (eventType, filename) => {
          // On most platforms, 'rename' is emitted whenever a filename appears or disappears in the directory.
          if (eventType !== 'rename' || !this.isFileMatchMask(filename)) {
            return;
          }
          const fullPath = path.join(this.directory, filename);
          if (!fs.existsSync(fullPath)) {
            // file was probably removed
            return;
          }
          this.tailfHandler.close();
          this.tailfHandler = tailf(fullPath);
        });
      }

      this.tailfHandler = tailf(this.files[0]);
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

  private isFileMatchMask(filename: string): boolean {
    const { rotationMask, config: { file } } = this;

    if (!rotationMask) {
      return false;
    }

    const { name, regexp } = this.memo(() => {
      const name = path.basename(file, `.{${rotationMask}}`);
      const regexp = new RegExp(rotationMask.replace(/\w/g, '\\d') + '$');
      return { name, regexp };
    }, []);

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
