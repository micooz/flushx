import * as signale from 'signale';

const logLevel = process.env.LOG_LEVEL;

signale.config({
  logLevel,
  displayTimestamp: true,
});

export const Logger = signale;
