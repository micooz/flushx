import { Application } from './framework';

export default function routers(app: Application): void {
  const { router, controller } = app;

  router.get('/api/getMetrics', controller.metric.getMetrics);
  router.get('/api/getMetric', controller.metric.getMetric);
  router.get('/api/getMetricGraph', controller.metric.getMetricGraph);
}
