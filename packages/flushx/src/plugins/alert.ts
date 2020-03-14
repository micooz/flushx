import { IPlugin, PluginExecuteInput } from './index';
import { Context } from '../context';

export interface IAlertPlugin extends IPlugin {

  execute(ctx: Context, input: AlertPluginExecuteInput): void;

}

export interface AlertPluginExecuteInput extends PluginExecuteInput {

}
