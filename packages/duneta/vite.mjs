import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const candidates = [
  path.join(root, 'client/dist/configs/vite.js'),
  path.join(root, '../client/dist/configs/vite.js'),
];
const entry = candidates.find((file) => fs.existsSync(file));

if (!entry) {
  throw new Error('[duneta] client is not built. Run pnpm --filter duneta-client run build');
}

const { createDunetaViteConfig } = await import(pathToFileURL(entry).href);
export { createDunetaViteConfig };
