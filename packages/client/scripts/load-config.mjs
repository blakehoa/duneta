import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const clientRoot = fileURLToPath(new URL('..', import.meta.url));
const webRoot = process.argv[2] ?? process.cwd();

const distLoad = path.join(clientRoot, 'dist/configs/load.js');
const srcLoad = path.join(clientRoot, 'configs/load.ts');
const loadModule = existsSync(distLoad) ? distLoad : srcLoad;

const { loadConfig } = await import(pathToFileURL(loadModule).href);
const config = await loadConfig(webRoot);
process.stdout.write(JSON.stringify(config));
