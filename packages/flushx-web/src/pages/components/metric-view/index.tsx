import React, { useRef, useMemo } from 'react';
import { Spin } from 'antd';
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
  const $dom = useRef(null);

  const { uuid, config } = value;
  const now = Date.now();
  const { data, error, loading } = useRequest(() => getMetricGraph({
    uuid,
    from: now - 5 * 60 * 1000,
    to: now,
  }));

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

  useCondition(graphData && !loading, () => {
    const chart = new Line($dom.current, {
      title: {
        visible: true,
        text: config.name,
      },
      description: {
        visible: true,
        text: config.description,
      },
      forceFit: true,
      data: graphData,
      padding: 'auto',
      xField: 'timestamp',
      yField: 'value',
      xAxis: {
        type: 'time',
        mask: getDateMask(config.period),
      },
      legend: true,
      seriesField: 'type',
      responsive: true,
    });

    chart.render();

    return () => {
      chart.destroy();
    };
  });

  return (
    <Spin spinning={loading}>
      <div className={styles.metricView}>
        <div ref={$dom} />
      </div>
    </Spin>
  );
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
