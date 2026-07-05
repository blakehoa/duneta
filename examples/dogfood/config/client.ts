import { defineClientConfig } from 'duneta/config/client';

export default defineClientConfig({
  app: {
    name: 'duneta',
    env: 'development',
  },
  theme: { default: 'light' },
  api: { baseUrl: '/api' },
});
