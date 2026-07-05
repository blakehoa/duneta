import { defineServerConfig } from 'duneta/config/server';
import {
  DEFAULT_DATABASE_POOL,
  defineConnections,
  RECOMMENDED_RATE_LIMIT_RULES,
} from 'duneta/config/server';

export default defineServerConfig({
  database: {
    enabled: true,
    default: 'primary',
    connections: defineConnections({
      primary: { driver: 'postgres', url: process.env.DATABASE_URL ?? '' },
    }),
    pool: DEFAULT_DATABASE_POOL,
  },
  auth: {
    enabled: true,
    baseUrl: process.env.AUTH_BASE_URL ?? 'http://localhost:8787',
    secret: process.env.AUTH_SECRET ?? '',
  },
  security: {
    rateLimit: {
      enabled: true,
      rules: RECOMMENDED_RATE_LIMIT_RULES,
    },
    csrf: {
      enabled: true,
      secret: process.env.CSRF_SECRET ?? '',
    },
  },
  logging: {
    enabled: true,
    format: 'json',
  },
  storage: { enabled: false },
});
