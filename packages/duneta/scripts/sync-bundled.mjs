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

  if (!fs.existsSync(source)) {
    console.warn(`[duneta] skip sync ${name}: ${source} not found`);
    return;
  }

  if (cleanMode) {
    if (fs.existsSync(target) && !fs.lstatSync(target).isSymbolicLink()) {
      fs.rmSync(target, { recursive: true, force: true });
    }
    return;
  }

  if (fs.existsSync(target)) {
    const stat = fs.lstatSync(target);
    if (stat.isSymbolicLink()) {
      fs.unlinkSync(target);
    } else if (copyMode) {
      fs.rmSync(target, { recursive: true, force: true });
    } else {
      return;
    }
  }

  if (copyMode) {
    fs.cpSync(source, target, { recursive: true });
    return;
  }

  const relative = path.relative(dunetaDir, source);
  fs.symlinkSync(relative, target, 'dir');
}

sync('client');
sync('server');
