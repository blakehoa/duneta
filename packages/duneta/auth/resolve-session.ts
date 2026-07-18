import type { Context } from 'hono';
import { getAuthInvocationDatabase } from '../http/database/invocation-context.js';
import type { RequestContext } from '../middleware/http/request-context.js';
import type { AuthSession } from '../middleware/http/types.js';
import { HttpError } from '../permission/errors.js';
import type { Auth } from './types.js';

const sessionRequests = new WeakMap<
  Context<RequestContext>,
  Promise<AuthSession | null>
>();

/** Store a resolved authenticated session on the Hono context. */
function rememberSession(
  c: Context<RequestContext>,
  session: AuthSession | null,
): AuthSession | null {
  if (session?.user) {
    c.set('session', session);
    c.set('userId', session.user.id);
  }
  return session;
}

function isDatabaseNotOpenError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes('is not open for this invocation')
  );
}

function isDatabaseInfrastructureError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes('timeout') ||
    message.includes('econnrefused') ||
    message.includes('econnreset') ||
    message.includes('enotfound') ||
    message.includes('hyperdrive') ||
    message.includes('database scope is already closed') ||
    message.includes('missing hyperdrive') ||
    message.includes('no database scope is active')
  );
}

/**
 * Read the session from Better Auth. Prefer cookie-cache hits (no DB open).
 * Open the auth Hyperdrive client only when the sync facade reports it is needed.
 */
async function readAuthSession(
  auth: Auth,
  headers: Headers,
): Promise<AuthSession | null> {
  try {
    return await auth.api.getSession({ headers });
  } catch (error) {
    if (!isDatabaseNotOpenError(error)) throw error;

    const authDb = await getAuthInvocationDatabase();
    if (!authDb) {
      throw new HttpError(
        'Session store unavailable',
        503,
        'SESSION_UNAVAILABLE',
      );
    }
    return auth.api.getSession({ headers });
  }
}

/** Resolve the Better Auth session once per request; reuse `session` / in-flight promise. */
export async function resolveAuthSession(
  c: Context<RequestContext>,
): Promise<AuthSession | null> {
  const cached = c.get('session');
  if (cached) return cached;

  const inFlight = sessionRequests.get(c);
  if (inFlight) return inFlight;

  const auth = c.get('auth') as Auth | undefined;
  if (!auth) return null;

  const sessionPromise = readAuthSession(auth, c.req.raw.headers)
    .then((session) => rememberSession(c, session))
    .catch((error) => {
      if (error instanceof HttpError) throw error;
      if (isDatabaseInfrastructureError(error)) {
        console.error(
          '[duneta] resolveAuthSession infrastructure failure:',
          error instanceof Error ? error.message : error,
        );
        throw new HttpError(
          'Session store unavailable',
          503,
          'SESSION_UNAVAILABLE',
        );
      }
      console.warn(
        '[duneta] resolveAuthSession failed (treating as unauthenticated):',
        error instanceof Error ? error.message : error,
      );
      return null;
    });

  sessionRequests.set(c, sessionPromise);
  return sessionPromise;
}
