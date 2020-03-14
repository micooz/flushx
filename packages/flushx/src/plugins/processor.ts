import { IPlugin, ParserPluginExecuteResult, PluginExecuteResult } from './index';
import { Context } from '../context';

export interface IProcessorPlugin extends IPlugin {

  execute(ctx: Context, input?: ProcessorPluginExecuteInput): Promise<ProcessorPluginExecuteResult>;

}

export interface ProcessorPluginExecuteInput extends ParserPluginExecuteResult {
  period: ProcessorPeriod;
}

export interface ProcessorPluginExecuteResult extends PluginExecuteResult {
  /**
   * The period time in Date representation
   */
  period: ProcessorPeriod;

  /**
   *
   */
  data: Map<ProcessorSeriesKey, ProcessorSeriesValue>;
}

export type ProcessorPeriod = Date;
export type ProcessorSeriesKey = string;
// eslint-disable-next-line
export type ProcessorSeriesValue = any;
