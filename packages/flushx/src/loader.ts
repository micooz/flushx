import { IPlugin, PluginType } from './plugins';
import { PluginConfig } from './config';

export type PluginMap = Map<PluginType, IPlugin>;

export class PluginLoader {

  public plugins: PluginMap = new Map();

  async load(type: PluginType, target?: PluginConfig): Promise<IPlugin> {
    if (!target) {
      return;
    }

    const { plugin, config } = target;
    if (!plugin) {
      throw Error('[plugin-loader] plugin path must be defined');
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
    } catch (err) {
      throw Error(`[plugin-loader] fail to load plugin "${plugin}": ` + err.message);
    }

    // initialize plugin
    try {
      if (typeof impl.init === 'function') {
        await impl.init(config);
      }
    } catch (err) {
      throw Error(`[plugin-loader] fail to init plugin "${plugin}": ` + err.message);
    }

    // dispose exist plugin first
    if (this.plugins.has(type)) {
      await this.plugins.get(type).dispose();
    }

    this.plugins.set(type, impl);

    return impl;
  }

  async dispose(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      try {
        if (typeof plugin.dispose === 'function') {
          await plugin.dispose();
        }
      } catch (err) {
        const name = plugin.constructor.name;
        console.error(`[plugin-loader] fail to dispose plugin "${name}":`, err);
      }
    }
    this.plugins.clear();
  }

}
