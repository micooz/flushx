import { IPlugin, PluginExecuteResult } from './index';
import { CollectorPluginExecuteResult } from './collector';
import { Context } from '../context';

export interface IParserPlugin extends IPlugin {

  execute(ctx: Context, input?: CollectorPluginExecuteResult): Promise<ParserPluginExecuteResult>;

}

export interface ParserPluginExecuteResult extends PluginExecuteResult {
  data: ParsedItem[];
}

export interface ParsedItem {
  /**
   * The original log line
   */
  line: string;

  /**
   * The parsed results, multiple keys
   */
  parsed: Map<ParsedItemSeriesKey, ParsedItemSeriesValue>;
}

export type ParsedItemSeriesKey = string;
export type ParsedItemSeriesValue = string;
