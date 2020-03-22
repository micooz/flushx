'use strict';
const path = require('path');
const fse = require('fs-extra');
const { Logger } = require('flushx-utils');

const logger = Logger.scope('flushx-cli', 'plugin');

// flushx plugin utils
async function plugin({ create, update, pkg }) {
  if (create) {
    await createPlugin(pkg);
  }
  if (update) {
    await updatePlugin(pkg);
  }
}

async function createPlugin(name) {
  const src = path.join(__dirname, '../template/plugin');
  const dst = path.join(process.cwd(), name);

  logger.info(`copy template files to: ${dst}`);
  await fse.copy(src, dst);

  // update package.json name
  logger.info('update package.json');
  const pkg = path.join(dst, 'package.json');
  const pkgJson = require(pkg);
  pkgJson.name = name;
  await fse.writeFile(pkg, JSON.stringify(pkgJson, null, 2), { encoding: 'utf8' });

  // update README.md
  logger.info('update README.md');
  const readme = path.join(dst, 'README.md');
  await fse.writeFile(readme, `# ${name}\n`, { encoding: 'utf8' });

  logger.info(`successfully create plugin: ${name}`);
}

function updatePlugin(pkg) {
  // TODO
}

module.exports = plugin;
