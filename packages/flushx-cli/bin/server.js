'use strict';
const path = require('path');
const start = require('./start');
const { Application } = require('../lib/framework');

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

  console.log(`[flushx] web api server is running on ${port}`)
}

module.exports = server;
