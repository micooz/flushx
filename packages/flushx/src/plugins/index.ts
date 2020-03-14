import { Context } from '../context';

/**
 * 插件接口定义
 */
export interface IPlugin {

  /**
   * 插件初始化函数
   * @param config 插件配置
   */
  init?(config: PluginConfigure): Promise<void>;

  /**
   * 插件销毁函数
   */
  dispose?(): Promise<void>;

  /**
   * 插件异步执行函数
   * @param ctx 上下文参数
   * @param input 输入参数，具体要看具体插件类型
   * @return 插件执行结果
   */
  execute(ctx: Context, input?: PluginExecuteInput):
    Promise<PluginExecuteResult | void> | void;

}

/**
 * 插件配置
 */
export interface PluginConfigure {
  // 由特定类型的插件自己定义
}

/**
 * 插件执行入参
 */
export interface PluginExecuteInput {
  // 由特定类型的插件自己定义
}

/**
 * 插件执行出参
 */
export interface PluginExecuteResult {
  // 由特定类型的插件自己定义
}

export * from './types';
export * from './collector';
export * from './parser';
export * from './processor';
export * from './writer';
export * from './reader';
export * from './alert';
