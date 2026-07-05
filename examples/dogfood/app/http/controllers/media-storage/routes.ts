import { defineGroup } from 'duneta/http/router';
import { resolveController } from 'duneta/http';

const controllerKey = 'ImageMediaStorageController';

export const imageMediaStorageRoutes = defineGroup({
  path: '/media',
  middleware: [],
  endpoints: [
    {
      method: 'POST',
      path: '/images',
      handler: resolveController(controllerKey, 'store'),
    },
    {
      method: 'GET',
      path: '/images/meta',
      handler: resolveController(controllerKey, 'head'),
    },
    {
      method: 'DELETE',
      path: '/images',
      handler: resolveController(controllerKey, 'destroy'),
    },
  ],
});
