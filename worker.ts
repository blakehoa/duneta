import { createRequestHandler, RouterContextProvider } from 'react-router';
import { createDunetaWorker, defineServer } from 'duneta/server/runtime/worker';
import { createAppRouter } from './app/api/router';
import { resolvePermissions } from './app/api/permissions';
import { registerServices } from './app/api/services';
import { registerCron } from './app/api/cron';

const api = defineServer({
  importConfig: () => import('./duneta.server.config'),
  createAppRouter,
  registerServices,
  registerCron,
  resolvePermissions,
});

const web = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.PROD ? 'production' : import.meta.env.MODE,
);

export default createDunetaWorker(api, (request) => web(request, new RouterContextProvider()));
