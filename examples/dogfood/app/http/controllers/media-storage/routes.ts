import { ApiRoute } from 'duneta/routes';
import { resolveController } from 'duneta/http';

const controllerKey = 'ImageMediaStorageController';

export const imageMediaStorageRoutes = ApiRoute.define({
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
