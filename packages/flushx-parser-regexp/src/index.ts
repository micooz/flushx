import {
  Context,
  IParserPlugin,
  PluginConfig,
  ParsedItem,
  ParsedItemSeriesKey,
  ParsedItemSeriesValue,
  ParserPluginExecuteResult,
  CollectorPluginExecuteResult,
} from 'flushx';

export default class RegexpParserPlugin implements IParserPlugin {

  private series: Set<SeriesItem> = new Set<SeriesItem>();

  async init(config: RegexpParserPluginConfig): Promise<void> {
    const { name, regexp, series } = config;

    // 单 key
    if (name && regexp) {
      this.series.add({ name, regexp: new RegExp(regexp) });
      return;
    }

    // 多 key
    if (!Array.isArray(series) || series.length < 1) {
      throw Error('there must have one item in series');
    }

    for (const { name, regexp } of series) {
      this.series.add({ name, regexp: new RegExp(regexp) });
    }
  }

  async dispose(): Promise<void> {
    this.series.clear();
  }

  async execute(ctx: Context, input: CollectorPluginExecuteResult): Promise<ParserPluginExecuteResult> {
    const data: ParsedItem[] = [];

    for (const line of input.data) {
      if (!line) {
        continue;
      }
      const map = new Map<ParsedItemSeriesKey, ParsedItemSeriesValue>();
      for (const { name, regexp } of this.series) {
        if (!name || !regexp) {
          continue;
        }
        const result = line.match(regexp);
        if (Array.isArray(result) && result.length > 0) {
          map.set(name, result[0]);
        }
      }
      if (map.size > 0) {
        data.push({ line, parsed: map });
      }
    }

    return { data };
  }

}

export interface RegexpParserPluginConfig extends PluginConfig {
  name?: string;
  regexp?: string;
  series?: SeriesItem[];
}

interface SeriesItem {
  name: string;
  regexp: string | RegExp;
}
