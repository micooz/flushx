import { Aggregator, Logger } from 'flushx-utils';
import { Config, ProcessPeriod } from './config';
import { Context } from './context';
import {
  ICollectorPlugin,
  IParserPlugin,
  IProcessorPlugin,
  IWriterPlugin,
  PluginType,
  ParsedItem,
  CollectorPluginExecuteResult,
} from './plugins';
import { PluginLoader, PluginMap } from './loader';
import getDateMaskRegexp from './utils/get-date-mask-regexp';
import getPeriodKey from './utils/get-period-key';

const logger = Logger.scope('flushx', 'executor');

export class Executor {

  private config: Config;

  private dateMaskRegexp: RegExp;

  private loader: PluginLoader;

  private context: Context;

  private aggregator = new Aggregator<number, ParsedItem>();

  get plugins(): PluginMap {
    return this.loader.plugins;
  }

  async init(config: Config): Promise<void> {
    const { period, dateMask, collector, parser, processor, writer, reader, alert } = config;

    // check period
    const allowPeriods = Object.values(ProcessPeriod);
    if (!allowPeriods.includes(period)) {
      throw Error(`[executor] period should choose from: ${allowPeriods}`);
    }

    // load all plugins
    const loader = new PluginLoader();
    await loader.load(PluginType.COLLECTOR, collector);
    await loader.load(PluginType.PARSER, parser);
    await loader.load(PluginType.PROCESSOR, processor);
    await loader.load(PluginType.WRITER, writer);
    await loader.load(PluginType.READER, reader);
    await loader.load(PluginType.ALERT, alert);

    const { plugins } = loader;

    if (!plugins.has(PluginType.COLLECTOR)) {
      throw Error('[executor] collector is not found');
    }
    if (!plugins.has(PluginType.PARSER)) {
      throw Error('[executor] parser is not found');
    }
    if (!plugins.has(PluginType.PROCESSOR)) {
      throw Error('[executor] processor is not found');
    }
    if (!plugins.has(PluginType.WRITER)) {
      throw Error('[executor] writer is not found');
    }

    // create context
    const context = {
      config,
    };

    this.dateMaskRegexp = getDateMaskRegexp(dateMask);
    this.config = config;
    this.context = context;
    this.aggregator = new Aggregator();
    this.loader = loader;
  }

  async run(): Promise<void> {
    const collector = this.plugins.get(PluginType.COLLECTOR) as ICollectorPlugin;
    collector.execute(this.context, { onData: this.process.bind(this) });
  }

  async process(collectorResult: CollectorPluginExecuteResult): Promise<void> {
    if (collectorResult.data.length < 1) {
      return;
    }
    const { plugins } = this;

    try {
      // parser
      const parser = plugins.get(PluginType.PARSER) as IParserPlugin;
      const parserResult = await parser.execute(this.context, collectorResult);

      if (parserResult.data.length < 1) {
        return;
      }

      const aggregateMap = this.aggregator.aggregateBy(parserResult.data, (item: ParsedItem) => {
        const { period } = this.config;
        const { line } = item;
        if (!line) {
          return;
        }
        const res = line.match(this.dateMaskRegexp);
        if (!Array.isArray(res) || res.length < 1) {
          return;
        }
        const date = new Date(res[0]);
        return getPeriodKey(date, period);
      });

      if (aggregateMap.size < 1) {
        return;
      }

      // processor
      const processor = plugins.get(PluginType.PROCESSOR) as IProcessorPlugin;

      for (const [key, value] of aggregateMap.entries()) {
        const processorResult = await processor.execute(this.context, {
          period: new Date(key),
          data: value,
        });

        // writer
        const writer = plugins.get(PluginType.WRITER) as IWriterPlugin;
        await writer.execute(this.context, processorResult);
      }
    } catch (err) {
      logger.error(`plugin execute failed:`, err);
    }
  }

  async dispose(): Promise<void> {
    if (this.loader) {
      logger.info(`dispose ${this.loader.plugins.size} plugins`);
      await this.loader.dispose();
    }
    if (this.aggregator) {
      this.aggregator.dispose();
    }
  }

}
