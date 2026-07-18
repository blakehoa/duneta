import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const rootManifestPath = join(root, 'package.json');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function workspaceManifestPaths() {
  const packageManifests = readdirSync(join(root, 'packages'), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(root, 'packages', entry.name, 'package.json'));

  let exampleManifests = [];
  try {
    exampleManifests = readdirSync(join(root, 'examples'), {
      withFileTypes: true,
    })
      .filter((entry) => entry.isDirectory())
      .map((entry) => join(root, 'examples', entry.name, 'package.json'));
  } catch {
    // No examples/ directory in this checkout.
  }

  return [...packageManifests, ...exampleManifests];
}

function assertVersion(version) {
  if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(
      `Expected a semantic version (for example 1.2.3), received: ${version}`,
    );
  }
}

function bump(version, kind) {
  const [major, minor, patch] = version.split('.').map(Number);
  if (kind === 'major') return `${major + 1}.0.0`;
  if (kind === 'minor') return `${major}.${minor + 1}.0`;
  if (kind === 'patch') return `${major}.${minor}.${patch + 1}`;
  throw new Error('Use major, minor, or patch.');
}

const [command, argument] = process.argv.slice(2);
const rootManifest = readJson(rootManifestPath);

if (command === 'check') {
  const mismatches = workspaceManifestPaths().flatMap((path) => {
    const manifest = readJson(path);
    return manifest.version === rootManifest.version
      ? []
      : [`${manifest.name}: ${manifest.version ?? 'missing'}`];
  });

  if (mismatches.length) {
    console.error(
      `Version source is ${rootManifest.version}; mismatched workspaces:\n${mismatches.join('\n')}`,
    );
    process.exit(1);
  }
  console.log(`All workspaces match duneta@${rootManifest.version}.`);
} else if (command === 'sync' || command === 'bump') {
  const version =
    command === 'sync' ? argument : bump(rootManifest.version, argument);
  assertVersion(version);
  rootManifest.version = version;
  writeJson(rootManifestPath, rootManifest);

  for (const path of workspaceManifestPaths()) {
    const manifest = readJson(path);
    manifest.version = version;
    writeJson(path, manifest);
  }
  console.log(`Synced duneta and all workspaces to ${version}.`);
} else {
  console.error(
    'Usage: version.mjs check | sync <version> | bump <major|minor|patch>',
  );
  process.exit(1);
}
