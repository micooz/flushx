import { workerData, parentPort } from 'worker_threads';
import { Executor } from './executor';
import { Config } from './config';

type WorkerData = {
  config: Config;
}

async function main({ config }: WorkerData): Promise<void> {
  const executor = new Executor();

  parentPort.on('message', async msg => {
    if (msg === 'cleanup') {
      await executor.dispose();
    }
    parentPort.postMessage({ msg: 'cleanup:done' });
  });

  await executor.init(config);

  parentPort.postMessage({ msg: 'ready' });
  await executor.run();
}

main(workerData);
