#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const force = args.includes('--force');
const filtered = args.filter((arg) => arg !== '--force');
const targetArg = filtered.find((arg) => !arg.startsWith('-'));
const targetDir = path.resolve(process.cwd(), targetArg ?? '.');

const templateDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'template');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    // npm pack strips leading-dot files (.npmrc, .gitignore); template stores them undotted.
    const destName =
      entry.name === 'npmrc' ? '.npmrc' : entry.name === 'gitignore' ? '.gitignore' : entry.name;
    const to = path.join(dest, destName);
    if (entry.isDirectory()) {
      copyDir(from, to);
      continue;
    }
    fs.copyFileSync(from, to);
  }
}

function renderFile(filePath, vars) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [key, value] of Object.entries(vars)) {
    content = content.replaceAll(`{{${key}}}`, value);
  }
  fs.writeFileSync(filePath, content);
}

function renderTemplates(dir, vars) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      renderTemplates(full, vars);
      continue;
    }
    if (fs.readFileSync(full, 'utf8').includes('{{')) {
      renderFile(full, vars);
    }
  }
}

if (!fs.existsSync(templateDir)) {
  console.error('[create-duneta-app] template missing');
  process.exit(1);
}

const existing = fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0;
if (existing && !force) {
  console.error(`[create-duneta-app] "${targetDir}" is not empty. Use --force to scaffold anyway.`);
  process.exit(1);
}

const projectName = path.basename(targetDir);
copyDir(templateDir, targetDir);

const packageJsonPath = path.join(targetDir, 'package.json');
const vars = { name: projectName };
renderFile(packageJsonPath, vars);
renderTemplates(targetDir, vars);

console.log(`[create-duneta-app] created ${targetDir}`);
console.log('');
console.log('  cd', targetArgLabel(targetDir));
console.log('  npm install');
console.log('  npm run dev');
console.log('');
console.log('Edit config/client.ts (web) and config/server.ts (API).');
console.log('Production secrets: wrangler secret put — see docs/configuration.md');

function targetArgLabel(dir) {
  return dir === process.cwd() ? '.' : projectName;
}

const install = spawnSync('npm', ['install'], { cwd: targetDir, stdio: 'inherit' });
if (install.status !== 0) {
  console.log('[create-duneta-app] run npm install manually.');
  process.exit(install.status ?? 1);
}
