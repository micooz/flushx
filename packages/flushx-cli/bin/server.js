'use strict';
const path = require('path');
const { Logger } = require('flushx-utils');
const start = require('./start');
const { Application } = require('../lib/framework');

const logger = Logger.scope('flushx-cli', 'server');

async function server({ port, dir }) {
  const manager = await start({ dir });

  const app = new Application({
    port,
    controllers: path.join(__dirname, '../lib/controllers'),
    routers: path.join(__dirname, '../lib/routers'),
  });

  await app.init({
    context: {
      manager,
    },
  });

  await app.start();

  logger.info(`web api server is listening on ${port}`)
}

module.exports = server;
