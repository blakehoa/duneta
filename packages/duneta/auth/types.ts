import type { AuthSession } from '../middleware/http/types.js';

/** Portable auth instance shape used by Duneta runtime. */
export type Auth = {
  handler: (request: Request) => Response | Promise<Response>;
  api: {
    getSession: (input: { headers: Headers }) => Promise<AuthSession | null>;
  };
};
