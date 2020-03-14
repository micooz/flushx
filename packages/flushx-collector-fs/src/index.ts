import * as fs from 'fs';
import { Context, ICollectorPlugin, PluginConfig, CollectorPluginExecuteInput } from 'flushx';
import { tail, TFHandle, TFMode, LineDecoder } from 'flushx-utils';

/**
 * 文件数据读取器
 */
export default class FsCollectorPlugin implements ICollectorPlugin {

  private config: FsCollectorPluginConfig;

  private tailfHandler: TFHandle;

  async init(config: FsCollectorPluginConfig): Promise<void> {
    const { file, mode } = config;

    if (!file) {
      throw Error('file must be set');
    }
    // 判断入参文件是否有效
    if (!fs.existsSync(file)) {
      throw Error(`"${file}" doesn't exists`);
    }
    // 判断入参文件是否有效
    const stat = fs.statSync(file);
    if (!stat.isFile()) {
      throw Error(`"${file}" must be a FILE`);
    }

    if (mode && !Object.values(ReadMode).includes(mode)) {
      throw Error(`unknown mode: "${mode}"`);
    }

    this.config = config;
    this.config.mode = mode || ReadMode.CONTINUOUS;
  }

  async dispose(): Promise<void> {
    if (this.tailfHandler) {
      this.tailfHandler.close();
      this.tailfHandler = null;
    }
  }

  execute(_ctx: Context, input: CollectorPluginExecuteInput): void {
    const { file, mode = ReadMode.CONTINUOUS } = this.config;
    if (this.tailfHandler) {
      return;
    }

    function emit(lines: string[]): void {
      input.onData({ data: lines });
    }

    if (mode === ReadMode.CONTINUOUS) {
      this.tailfHandler = tail(file, { encoding: 'utf8', mode: TFMode.F }, emit);
      return;
    }

    if (mode === ReadMode.ONE_TIME) {
      const data = fs.readFileSync(file);
      const decoder = new LineDecoder('utf8', '\n');
      decoder.on('lines', emit);
      decoder.put(data);
    }
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
  mode: ReadMode;
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
