import { IPlugin } from './index';
import { Context } from '../context';

export interface IReaderPlugin extends IPlugin {

  execute(ctx: Context, input: ReaderExecuteInput): Promise<ReaderExecuteResult>;

}

export interface ReaderExecuteInput {
  startTimestamp: number;
  endTimestamp: number;
}

export interface ReaderExecuteResult {

}
