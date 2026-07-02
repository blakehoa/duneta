#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dunetaDir = fileURLToPath(new URL('..', import.meta.url));
const copyMode = process.argv.includes('--copy');
const cleanMode = process.argv.includes('--clean');

function sync(name) {
  const source = path.resolve(dunetaDir, '..', name);
  const target = path.join(dunetaDir, name);

  if (cleanMode) {
    if (fs.existsSync(target) && !fs.lstatSync(target).isSymbolicLink()) {
      fs.rmSync(target, { recursive: true, force: true });
    }
    return;
  }

  if (!copyMode || !fs.existsSync(source)) return;

  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
  fs.cpSync(source, target, { recursive: true });
}

sync('client');
sync('server');
