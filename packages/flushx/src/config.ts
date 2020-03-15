export interface Config {
  name: string;
  description?: string;
  dateMask: string | DateMaskPreset;
  period: ProcessPeriod;
  collector: PluginConfig;
  parser: PluginConfig;
  processor: PluginConfig;
  writer: PluginConfig;
  reader?: PluginConfig;
  alert?: PluginConfig;
}

export interface PluginConfig {
  plugin: string;
  config?: object;
}

export enum ProcessPeriod {
  HOUR = 'h',
  MINUTE = 'm',
  SECOND = 's',
}

export enum DateMaskPreset {
  ISO8601 = '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z'
}
