import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { Config } from 'flushx';

function loadYaml(file: string): Config {
  if (!file || !fs.existsSync(file)) {
    throw Error('yaml file must be specified and exist');
  }

  const parsed = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
  if (!parsed) {
    throw Error('yaml file was invalid');
  }

  return parsed;
}

module.exports = loadYaml;
