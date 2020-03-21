import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
// import { Worker } from 'worker_threads';
import { Logger } from 'flushx-utils';
import { Config } from './config';
import { Executor } from './executor';

const logger = Logger.scope('flushx', 'manager');
const THREAD_SCRIPT = path.join(__dirname, 'thread-script.js');

type Metric = {
  uuid: string;
  config: Config;
  // eslint-disable-next-line
  worker?: any;
  executor?: Executor;
};

type WorkerMessage = {
  msg: string;
  // eslint-disable-next-line
  data: any;
};

// multi-thread executor manager
export class Manager {

  private metrics: Metric[] = [];

  getMetrics(): Metric[] {
    return this.metrics;
  }

  getMetricByUUID(uuid: string): Metric {
    return this.metrics.find(item => item.uuid === uuid);
  }

  async load(config: Config): Promise<Metric> {
    const uuid = uuidv4();
    const executor = new Executor();

    await executor.init(config);
    executor.run();

    const metric = {
      uuid,
      config,
      executor,
    };

    this.metrics.push(metric);

    return metric;
  }

  // using worker_threads, by have problem work with better-sqlite3
  // https://github.com/JoshuaWise/better-sqlite3/issues/237
  private async spawn(config: Config): Promise<Metric> {
    const { Worker } = await import('worker_threads');
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      const worker = new Worker(THREAD_SCRIPT, {
        workerData: { config },
      });

      worker.on('message', (payload: WorkerMessage) => {
        const { msg } = payload;
        if (msg === 'ready') {
          const metric = {
            uuid,
            config,
            worker,
          };
          this.metrics.push(metric);
          resolve(metric);
        }
        else if (msg === 'cleanup:done') {
          worker.terminate();
          worker.removeAllListeners();
        }
      });

      worker.on('error', reject);

      worker.on('exit', code => {
        if (code !== 0) {
          const message = `metric ${uuid} exited with code: ${code}`;
          logger.error(message);
          reject(new Error(message));
        }
      });
    });
  }

  async dispose(): Promise<void> {
    for (const { uuid, worker, executor, config } of this.metrics) {
      logger.info(`dispose metric: (${config.name})(${uuid})`);
      if (worker) {
        logger.info('dispose worker');
        worker.postMessage('cleanup');
      }
      if (executor) {
        logger.info('dispose executor');
        await executor.dispose();
      }
    }
    this.metrics = [];
  }

}
