#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const distDir = process.argv[2];
if (!distDir) {
  console.error('Usage: fix-esm-imports.mjs <distDir>');
  process.exit(1);
}

const SKIP_EXT = new Set(['.js', '.mjs', '.cjs', '.json', '.css', '.wasm', '.node']);

function resolveRelativeSpec(spec, fromFile) {
  if (!spec.startsWith('.')) return spec;
  const [base, query = ''] = spec.split('?');
  const ext = path.extname(base);
  if (ext && SKIP_EXT.has(ext)) return spec;

  const abs = path.resolve(path.dirname(fromFile), base);
  const suffix = query ? `?${query}` : '';

  if (fs.existsSync(`${abs}.js`)) {
    return `${base}.js${suffix}`;
  }
  if (fs.existsSync(path.join(abs, 'index.js'))) {
    return `${base}/index.js${suffix}`;
  }

  return `${base}.js${suffix}`;
}

function fixSource(source, fromFile) {
  const fix = (spec) => resolveRelativeSpec(spec, fromFile);
  return source
    .replace(
      /(\bfrom\s+['"])(\.\.?\/[^'"]+)(['"])/g,
      (_, pre, spec, post) => `${pre}${fix(spec)}${post}`,
    )
    .replace(
      /(\bimport\s*\(\s*['"])(\.\.?\/[^'"]+)(['"]\s*\))/g,
      (_, pre, spec, post) => `${pre}${fix(spec)}${post}`,
    )
    .replace(
      /(\bimport\s+['"])(\.\.?\/[^'"]+)(['"])/g,
      (_, pre, spec, post) => `${pre}${fix(spec)}${post}`,
    );
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!entry.name.endsWith('.js')) continue;
    const content = fs.readFileSync(full, 'utf8');
    const fixed = fixSource(content, full);
    if (fixed !== content) fs.writeFileSync(full, fixed);
  }
}

walk(path.resolve(distDir));
