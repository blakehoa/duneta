import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(root, 'dist/config/client/vite.js');

if (!fs.existsSync(entry)) {
  throw new Error('[duneta] package is not built. Run pnpm --filter duneta run build');
}

const { createDunetaViteConfig } = await import(pathToFileURL(entry).href);
export { createDunetaViteConfig };
