import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDunetaViteConfig } from 'duneta/vite';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(repoRoot, 'app');

export default createDunetaViteConfig(repoRoot, appRoot);
