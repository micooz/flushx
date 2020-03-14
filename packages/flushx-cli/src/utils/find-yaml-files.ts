import * as fs from 'fs';
import * as path from 'path';

async function findYamlFiles(dir: string): Promise<string[]> {
  const files = await fs.promises.readdir(dir);
  return files.map((file: string) => {
    const fullPath = path.join(dir, file);
    if (path.extname(fullPath) === '.yaml') {
      return fullPath;
    }
    return null;
  }).filter(Boolean);
}

module.exports = findYamlFiles;
