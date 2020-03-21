'use strict';
const path = require('path');
const { Manager } = require('flushx');
const { Logger } = require('flushx-utils');
const loadYaml = require('../lib/utils/load-yaml');
const findYamlFiles = require('../lib/utils/find-yaml-files');

const logger = Logger.scope('flushx-cli', 'start');

// start flushx
async function start({ dir }) {
  logger.info(`looking for yaml files from: ${dir}`);

  const yamlFiles = await findYamlFiles(dir);

  logger.info(`found ${yamlFiles.length} yaml files`);

  const manager = new Manager();

  for (const file of yamlFiles) {
    const filename = path.basename(file);
    const config = loadYaml(file);
    logger.info(`loading metric: ${filename} (${config.name})`);

    const { uuid } = await manager.load(config);
    logger.info(`loaded metric: ${filename} (${config.name})(${uuid})`);
  }

  async function cleanup() {
    logger.info('cleanup');
    await manager.dispose();
    process.exit(0);
  }

  // gracefully shutting down from SIGINT (Ctrl-C)
  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);

  logger.info(`flushx is running now`);

  return manager;
}

module.exports = start;
