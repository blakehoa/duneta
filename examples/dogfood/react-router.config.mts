import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createReactRouterConfig } from 'duneta/config/client/react-router';
import { loadConfig } from 'duneta/config/client/load';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));
const config = await loadConfig(repoRoot);

export default createReactRouterConfig(config);
