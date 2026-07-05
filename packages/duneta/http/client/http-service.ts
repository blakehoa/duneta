import { config } from '../../config/client/registry.js';
import { BaseHttpService } from './base-http-service.js';
import type { HttpServiceOptions } from './types.js';

export class HttpService extends BaseHttpService {
  protected getBaseUrl(): string {
    return this.options.baseUrl ?? config.api.baseUrl;
  }
}

export const http = new HttpService();

export function createHttpService(options: HttpServiceOptions = {}) {
  return new HttpService(options);
}
