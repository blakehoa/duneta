import { defineServerConfig } from 'duneta/config/server';

export default defineServerConfig({
  database: {
    enabled: false,
  },
  auth: {
    enabled: false,
  },
  security: {
    rateLimit: {
      enabled: false,
    },
    csrf: {
      enabled: false,
    },
  },
  logging: {
    enabled: false,
  },
  storage: { enabled: false },
});
