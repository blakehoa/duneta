import { defineClientConfig } from 'duneta/client/configs';

/** Minimal app — web only. Server features opt-in in `duneta.server.config.ts`. */
export default defineClientConfig({
  app: {
    name: '{{name}}',
    env: 'development',
  },
  theme: { default: 'light' },
  api: { baseUrl: '/api' },
});
