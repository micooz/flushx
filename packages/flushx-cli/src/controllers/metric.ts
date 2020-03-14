import * as _ from 'lodash';
import { PluginType, IReaderPlugin, Manager, Config, ReaderExecuteResult } from 'flushx';
import { Context } from '../framework';

export default class MetricController {

  private ctx: { manager: Manager } & Context;

  async getMetrics(): Promise<Metrics> {
    const { manager } = this.ctx;
    return manager.getMetrics().map(item => _.pick(item, ['uuid', 'config']));
  }

  async getMetric(params: GetMetricRequest): Promise<Metric> {
    const { uuid } = params;
    const { manager } = this.ctx;
    return _.pick(manager.getMetricByUUID(uuid), ['uuid', 'config']);
  }

  async getMetricGraph(params: GetMetricGraphRequest): Promise<MetricGraph> {
    const { manager } = this.ctx;
    const { uuid, from, to } = params;

    const metric = manager.getMetricByUUID(uuid);
    if (!metric) {
      return null;
    }

    const reader = metric.executor.plugins.get(PluginType.READER) as IReaderPlugin;
    if (!reader) {
      return null;
    }

    const data = await reader.execute(null, {
      startTimestamp: from,
      endTimestamp: to,
    });

    return data;
  }

}

export type GetMetricRequest = {
  uuid: string;
};

export type Metric = {
  uuid: string;
  config: Config;
};

export type Metrics = Metric[];

export type GetMetricGraphRequest = {
  uuid: string;
  from: number;
  to: number;
};

export type MetricGraph = ReaderExecuteResult;
