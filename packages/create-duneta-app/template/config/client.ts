import { defineClientConfig } from 'duneta/config/client';

/** Minimal app — web only. Server features opt-in in `config/server.ts`. */
export default defineClientConfig({
  app: {
    name: '{{name}}',
    env: 'development',
  },
  theme: { default: 'light' },
  api: { baseUrl: '/api' },
});
