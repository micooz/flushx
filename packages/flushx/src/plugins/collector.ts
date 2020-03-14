import { IPlugin, PluginExecuteInput, PluginExecuteResult } from './index';
import { Context } from '../context';

export interface ICollectorPlugin extends IPlugin {

  execute(ctx: Context, input: CollectorPluginExecuteInput): void;

}

export interface CollectorPluginExecuteInput extends PluginExecuteInput {
  onData(res: CollectorPluginExecuteResult): void;
}

export interface CollectorPluginExecuteResult extends PluginExecuteResult {
  data: string[];
}
