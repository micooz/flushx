#!/usr/bin/env node
'use strict';
const start = require('./start');
const plugin = require('./plugin');
const server = require('./server');
const api = require('./api');

const argv = require('yargs')
  .scriptName('flushx')
  .usage('$0 <cmd> [args]')
  /**
   * start
   */
  .command('start [dir]', 'start flushx monitor', yargs => {
    yargs.positional('dir', {
      type: 'string',
      describe: 'directory which contains metric config files',
    });
  }, start)
  /**
   * plugin
   */
  .command('plugin [create] [update] [pkg]', 'plugin utils', yargs => {
    yargs.positional('create', {
      type: 'boolean',
      describe: 'create a new plugin',
    });
    yargs.positional('update', {
      type: 'boolean',
      describe: 'update an exist plugin',
    });
    yargs.positional('pkg', {
      type: 'string',
      describe: 'the plugin package path',
    });
  }, plugin)
  /**
   * server
   */
  .command('server [port] [dir]', 'start flushx server', yargs => {
    yargs.positional('port', {
      type: 'number',
      describe: 'listen port',
    });
    yargs.positional('dir', {
      type: 'string',
      describe: 'directory which contains metric config files',
    });
  }, server)
  /**
   * api
   */
  .command('api [generate] [dir]', 'api maker', yargs => {
    yargs.positional('generate', {
      type: 'boolean',
      describe: 'generate request methods from controllers',
    });
    yargs.positional('dir', {
      type: 'string',
      describe: 'directory which store generated files',
    });
  }, api)
  .help()
  .argv;
