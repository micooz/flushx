import React, { useRef, useMemo, useEffect } from 'react';
import { useSetState } from 'react-use';
import { Radio } from 'antd';
import { Line } from '@antv/g2plot';
import { ProcessPeriod } from 'flushx/lib/config';
import useRequest from '@umijs/use-request';
import { getMetricGraph, Metric } from '@/services/metric';
import { useCondition } from '@/hooks';
import styles from './index.less';

type MetricViewProps = {
  value: Metric;
};

export default function MetricView({ value }: MetricViewProps) {
  const { uuid, config } = value;

  const defaultFrom = useMemo(() => {
    const options = getTimeSelectOptions(config.period);
    return options[options.length - 2].value;
  }, []);

  const [state, setState] = useSetState({
    timeSelectValue: defaultFrom,
    from: Date.now() - defaultFrom,
    to: Date.now(),
  });

  const { timeSelectValue, from, to } = state;

  function onTimeChange(v: number) {
    const now = Date.now();
    setState({ timeSelectValue: v, from: now - v, to: now });
  }

  return (
    <div className={styles.metricView}>
      <TimeSelect
        value={timeSelectValue}
        period={config.period}
        onChange={onTimeChange}
      />
      <Chart
        name={config.name}
        description={config.description || ''}
        uuid={uuid}
        from={from}
        to={to}
        timeAxisMask={getDateMask(config.period) || undefined}
      />
    </div>
  );
}

type TimeSelectProps = {
  value: number;
  period: ProcessPeriod,
  onChange: (value: number) => void,
};

function TimeSelect({ value, period, onChange }: TimeSelectProps) {
  const items = useMemo(() => getTimeSelectOptions(period), [period]);

  return (
    <Radio.Group
      size="small"
      className={styles.timeSelect}
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {items.map(({ label, value }, index) => (
        <Radio.Button key={index} value={value}>
          {label}
        </Radio.Button>
      ))}
    </Radio.Group>
  );
}

type ChartProps = {
  name: string;
  description: string;
  uuid: string;
  from: number;
  to: number;
  timeAxisMask?: string;
};

function Chart({ name, description, uuid, from, to, timeAxisMask }: ChartProps) {
  const $dom = useRef(null);

  const { data, run, loading } = useRequest(() => getMetricGraph({
    uuid,
    from,
    to,
  }), {
    refreshOnWindowFocus: true,
    pollingInterval: 5000,
  });

  useEffect(() => {
    run();
  }, [from, to]);

  const graphData = useMemo(() => {
    if (!Array.isArray(data)) {
      return null;
    }
    return data.reduce((acc, next) => {
      for (const [key, value] of Object.entries(next.data)) {
        const ds = { ...next, type: key, value };
        delete ds.data;
        acc.push(ds);
      }
      return acc;
    }, []);
  }, [data]);

  // console.log(graphData);

  useCondition(!!$dom.current && graphData && !loading, () => {
    const config = {
      title: {
        visible: true,
        text: name,
      },
      description: {
        visible: true,
        text: description || '',
      },
      width: 600,
      forceFit: true,
      data: graphData,
      padding: 'auto',
      xField: 'timestamp',
      yField: 'value',
      xAxis: {
        type: 'time',
        mask: timeAxisMask,
      },
      legend: {
        visible: true,
        position: 'bottom',
      },
      seriesField: 'type',
      responsive: true,
    };

    // @ts-ignore
    const chart = new Line($dom.current, config);

    chart.render();

    return () => {
      chart.destroy();
    };
  });

  return (
    <div className={styles.chart} ref={$dom} />
  );
}

function getTimeSelectOptions(period: ProcessPeriod) {
  if (period === ProcessPeriod.HOUR) {
    return [1, 3, 5, 12, 24].map(v => ({
      label: `${v}h`,
      value: v * 60 * 60 * 1000,
    }));
  }
  if (period === ProcessPeriod.MINUTE) {
    return [1, 3, 5, 10, 30].map(v => ({
      label: `${v}m`,
      value: v * 60 * 1000,
    }));
  }
  if (period === ProcessPeriod.SECOND) {
    return [1, 5, 10, 20, 30].map(v => ({
      label: `${v}s`,
      value: v * 1000,
    }));
  }
  return [];
}

function getDateMask(period: ProcessPeriod): string | null {
  if (period === ProcessPeriod.HOUR) {
    return 'HH:mm';
  }
  if (period === ProcessPeriod.MINUTE) {
    return 'HH:mm';
  }
  if (period === ProcessPeriod.SECOND) {
    return 'mm:ss';
  }
  return null;
}
