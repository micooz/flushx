import { Context, IProcessorPlugin, ProcessorPluginExecuteInput, ProcessorPluginExecuteResult } from 'flushx';

export default class SumProcessorPlugin implements IProcessorPlugin {

  async execute(_ctx: Context, input: ProcessorPluginExecuteInput): Promise<ProcessorPluginExecuteResult> {
    const { period, data } = input;
    const map = new Map<string, number>();

    for (const { parsed } of data) {
      for (const [k] of parsed.entries()) {
        const prev = map.get(k);
        if (prev) {
          map.set(k, prev + 1);
        } else {
          map.set(k, 1);
        }
      }
    }

    return { period, data: map };
  }

}
