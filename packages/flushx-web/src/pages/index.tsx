import React from 'react';
import useRequest from '@umijs/use-request';
import { Skeleton } from 'antd';
import { getMetrics } from '@/services/metric';

import MetricView from './components/metric-view';
import styles from './index.less';

export default function Page() {
  const { data, error, loading } = useRequest(() => getMetrics());

  if (loading) {
    return (
      <Skeleton active />
    );
  }

  if (error) {
    return <div>Error.</div>
  }

  return (
    <div className={styles.page}>
      {(data || []).map(item => (
        <MetricView key={item.uuid} value={item} />
      ))}
    </div>
  );
}
