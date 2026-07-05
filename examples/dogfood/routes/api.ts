import type { ApiRoute } from 'duneta/routes';
import { imageMediaStorageRoutes } from '../app/http/controllers/media-storage';

export default {
  api: [imageMediaStorageRoutes],
} satisfies ApiRoute.Config;
