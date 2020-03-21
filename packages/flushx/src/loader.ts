import { Logger } from 'flushx-utils';
import { IPlugin, PluginType } from './plugins';
import { PluginConfig } from './config';

const logger = Logger.scope('flushx', 'loader');

export type PluginMap = Map<PluginType, IPlugin>;

export class PluginLoader {

  public plugins: PluginMap = new Map();

  async load(type: PluginType, target?: PluginConfig): Promise<IPlugin> {
    if (!target) {
      return;
    }

    const { plugin, config } = target;
    if (!plugin) {
      throw Error('plugin path must be defined');
    }

    // load plugin module
    let impl;
    try {
      const pluginPath = require.resolve(plugin, {
        paths: [process.cwd()],
      });
      const mod = await import(pluginPath);
      const Class = mod.default || mod;
      // @ts-ignore
      impl = new Class();
      impl.name = plugin;
    } catch (err) {
      throw Error(`fail to load plugin "${plugin}": ` + err.message);
    }

    // initialize plugin
    try {
      if (typeof impl.init === 'function') {
        await impl.init(config);
      }
    } catch (err) {
      throw Error(`fail to init plugin "${plugin}": ` + err.message);
    }

    // dispose exist plugin first
    if (this.plugins.has(type)) {
      logger.info(`plugin: "${plugin}" exist, dispose it first`);
      await this.plugins.get(type).dispose();
    }

    this.plugins.set(type, impl);

    return impl;
  }

  async dispose(): Promise<void> {
    const plugins = [...this.plugins.values()];

    await Promise.all(plugins.map(plugin => {
      // @ts-ignore
      const { name } = plugin;
      try {
        if (typeof plugin.dispose === 'function') {
          logger.info(`dispose plugin: ${name}`);
          return plugin.dispose();
        } else {
          logger.info(`plugin: "${name}" doesn't have dispose function, skipped`);
        }
      } catch (err) {
        logger.error(`fail to dispose plugin "${name}":`, err);
      }
    }));

    this.plugins.clear();
  }

}
