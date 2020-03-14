'use strict';
const { Manager } = require('flushx');
const loadYaml = require('../lib/utils/load-yaml');
const findYamlFiles = require('../lib/utils/find-yaml-files');

// start flushx
async function start({ dir }) {
  const yamlFiles = await findYamlFiles(dir);
  const manager = new Manager();

  for (const file of yamlFiles) {
    const config = loadYaml(file);
    console.log(`[flushx] loading metric: ${config.name} ...`);

    const { uuid } = await manager.load(config);
    console.log(`[flushx] loaded metric: ${config.name}(${uuid})`);
  }

  async function cleanup() {
    console.log('[flushx] cleanup...');
    await manager.dispose();
  }

  // gracefully shutting down from SIGINT (Ctrl-C)
  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);

  console.log(`[flushx] running now`);

  return manager;
}

module.exports = start;
