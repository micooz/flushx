import React, { useRef, useEffect } from 'react';
import { Spin } from 'antd';
import { Line } from '@antv/g2plot';
import useRequest from '@umijs/use-request';
import { getMetrics, getMetricGraph, Metric } from '@/services/metric';
import styles from './index.less';

export default function Page() {
  const { data, error, loading } = useRequest(() => getMetrics());

  if (loading) {
    return <div>Loading....</div>;
  }

  if (error) {
    return <div>Error.</div>
  }

  return (
    <div className={styles.page}>
      {(data || []).map(item => (
        <MetricView key={item.uuid} metric={item} />
      ))}
    </div>
  );
}

function MetricView({ metric }: { metric: Metric }) {
  const $dom = useRef(null);

  const { uuid } = metric;
  const { data, error, loading } = useRequest(() => getMetricGraph({
    uuid,
    from: 1582699768000,
    to: 1582699771000,
  }));

  useEffect(() => {
    if ($dom.current && data && !loading) {
      const linePlot = new Line($dom.current, {
        title: {
          visible: true,
          text: '单折线图的基础用法',
        },
        description: {
          visible: true,
          text: '最基础简单的折线图使用方式，显示一个指标的趋势',
        },
        forceFit: true,
        data,
        padding: 'auto',
        xField: 'timestamp',
        yField: 'id',
        xAxis: {
          // label: {
          //   formatter: (v: number) => format(+v, 'HH:mm'),
          // },
        },
        legend: {
          position: 'right-top',
        },
        // seriesField: 'type',
        responsive: true,
      });

      linePlot.render();
    }
  }, [data, loading]);

  return (
    <Spin spinning={loading}>
      <div className={styles.metric}>
        <div ref={$dom} />
      </div>
    </Spin>
  );
}
