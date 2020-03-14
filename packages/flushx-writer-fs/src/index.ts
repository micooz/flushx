import * as fs from 'fs';
import { Context, IWriterPlugin, PluginConfig, ProcessorPluginExecuteResult } from 'flushx';
import { mapToJson } from 'flushx-utils';

export default class FsWriterPlugin implements IWriterPlugin {

  private config: FsWriterPluginConfig;

  async init(config: FsWriterPluginConfig): Promise<void> {
    this.config = config;
  }

  async execute(ctx: Context, input: ProcessorPluginExecuteResult): Promise<void> {
    const { file } = this.config;
    const { period, data } = input;
    const str = `${period.toISOString()} ${JSON.stringify(mapToJson(data))}\n`;
    await fs.promises.appendFile(file, str, { encoding: 'utf8' });
  }

}

export interface FsWriterPluginConfig extends PluginConfig {
  file: string;
}
