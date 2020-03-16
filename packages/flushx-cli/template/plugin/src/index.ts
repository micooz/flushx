import { Context, IPlugin, PluginConfig, PluginExecuteInput, PluginExecuteResult } from 'flushx';

export default class ExamplePlugin implements IPlugin {

  async init(config: PluginConfig): Promise<void> {

  }

  async dispose(): Promise<void> {

  }

  execute(ctx: Context, input: PluginExecuteInput): Promise<PluginExecuteResult> | void {

  }

}
