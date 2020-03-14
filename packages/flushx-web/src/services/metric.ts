// NOTICE: YOU SHOULD NOT MODIFY THIS FILE MANUALLY
import { request } from "@/utils";
import { Config, ReaderExecuteResult } from 'flushx';
export declare type GetMetricRequest = {
  uuid: string;
};
export declare type Metric = {
  uuid: string;
  config: Config;
};
export declare type Metrics = Metric[];
export declare type GetMetricGraphRequest = {
  uuid: string;
  from: number;
  to: number;
};
export declare type MetricGraph = ReaderExecuteResult;
export async function getMetrics(): Promise<Metrics> {
  return request("/getMetrics");
}
export async function getMetric(params: GetMetricRequest): Promise<Metric> {
  return request("/getMetric", {
    params: params
  });
}
export async function getMetricGraph(params: GetMetricGraphRequest): Promise<MetricGraph> {
  return request("/getMetricGraph", {
    params: params
  });
}