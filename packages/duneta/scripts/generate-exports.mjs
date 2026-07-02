import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dunetaDir = fileURLToPath(new URL('..', import.meta.url));
const publishMode = process.argv.includes('--publish');

function prefixExports(exports, segment, baseDir) {
  const result = {};
  for (const [key, value] of Object.entries(exports)) {
    if (key === './package.json') {
      result[`./${segment}/package.json`] = `${baseDir}/package.json`;
      continue;
    }
    const suffix = key === '.' ? '' : key.slice(1);
    const newKey = `./${segment}${suffix}`;
    if (typeof value === 'string') {
      result[newKey] = `${baseDir}${value.slice(1)}`;
      continue;
    }
    if (value && typeof value === 'object') {
      const entry = {};
      for (const [field, target] of Object.entries(value)) {
        if (typeof target === 'string' && target.startsWith('./')) {
          entry[field] = `${baseDir}${target.slice(1)}`;
        } else {
          entry[field] = target;
        }
      }
      result[newKey] = entry;
    }
  }
  return result;
}

const clientPkg = JSON.parse(fs.readFileSync(path.join(dunetaDir, '../client/package.json'), 'utf8'));
const serverPkg = JSON.parse(fs.readFileSync(path.join(dunetaDir, '../server/package.json'), 'utf8'));
const dunetaPkg = JSON.parse(fs.readFileSync(path.join(dunetaDir, 'package.json'), 'utf8'));

dunetaPkg.exports = {
  './package.json': './package.json',
  './vite': './vite.mjs',
  ...prefixExports(clientPkg.exports, 'client', './client'),
  ...prefixExports(serverPkg.exports, 'server', './server'),
};

dunetaPkg.files = publishMode
  ? ['bin', 'vite.mjs', 'scripts', 'client', 'server']
  : ['bin', 'vite.mjs', 'scripts'];

fs.writeFileSync(path.join(dunetaDir, 'package.json'), `${JSON.stringify(dunetaPkg, null, 2)}\n`);
