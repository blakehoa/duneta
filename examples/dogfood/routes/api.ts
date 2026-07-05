import type { DunetaApiRoutes } from 'duneta/worker';
import { imageMediaStorageRoutes } from '../app/http/controllers/media-storage';

export default {
  api: [imageMediaStorageRoutes],
} satisfies DunetaApiRoutes;
