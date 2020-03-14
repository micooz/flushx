import { IPlugin, ProcessorPluginExecuteResult } from './index';
import { Context } from '../context';

export interface IWriterPlugin extends IPlugin {

  execute(ctx: Context, input: ProcessorPluginExecuteResult): Promise<void> | void;

}
