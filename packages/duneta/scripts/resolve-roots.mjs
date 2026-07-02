import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function resolveDunetaRoots(fromUrl = import.meta.url) {
  const require = createRequire(fromUrl);
  const dunetaDir = fileURLToPath(new URL('..', fromUrl));

  const workspaceClient = path.join(dunetaDir, '../client/package.json');
  const workspaceServer = path.join(dunetaDir, '../server/package.json');
  if (fs.existsSync(workspaceClient) && fs.existsSync(workspaceServer)) {
    return {
      clientRoot: path.dirname(workspaceClient),
      serverRoot: path.dirname(workspaceServer),
    };
  }

  const bundledClient = path.join(dunetaDir, 'client', 'package.json');
  const bundledServer = path.join(dunetaDir, 'server', 'package.json');
  if (fs.existsSync(bundledClient) && fs.existsSync(bundledServer)) {
    return {
      clientRoot: path.dirname(bundledClient),
      serverRoot: path.dirname(bundledServer),
    };
  }

  return {
    clientRoot: path.dirname(require.resolve('duneta-client/package.json')),
    serverRoot: path.dirname(require.resolve('duneta-server/package.json')),
  };
}
