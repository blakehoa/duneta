import type {
  DunetaPageHandler,
  DunetaPageMiddleware,
  DunetaPageMiddlewareContext,
} from './types.js';

export type RunPageMiddlewaresOptions<TLoadContext = unknown> = {
  request: Request;
  responseHeaders?: Headers;
  responseStatusCode?: number;
  loadContext?: TLoadContext;
  locals?: Record<string, unknown>;
};

export function composePageMiddlewares<TLoadContext = unknown>(
  middlewares: DunetaPageMiddleware<TLoadContext>[],
  handler: DunetaPageHandler<TLoadContext>,
): DunetaPageHandler<TLoadContext> {
  return async (context) => {
    let index = -1;

    async function dispatch(position: number): Promise<Response> {
      if (position <= index) {
        throw new Error('next() called multiple times in a Duneta page middleware');
      }

      index = position;
      const middleware = middlewares[position];
      if (!middleware) return handler(context);

      return middleware(context, () => dispatch(position + 1));
    }

    return dispatch(0);
  };
}

export function createPageMiddlewareContext<TLoadContext = unknown>({
  request,
  responseHeaders = new Headers(),
  responseStatusCode = 200,
  loadContext,
  locals = {},
}: RunPageMiddlewaresOptions<TLoadContext>): DunetaPageMiddlewareContext<TLoadContext> {
  return {
    request,
    url: new URL(request.url),
    responseHeaders,
    responseStatusCode,
    loadContext,
    locals,
  };
}

export function runPageMiddlewares<TLoadContext = unknown>(
  options: RunPageMiddlewaresOptions<TLoadContext>,
  middlewares: DunetaPageMiddleware<TLoadContext>[],
  handler: DunetaPageHandler<TLoadContext>,
) {
  return composePageMiddlewares(middlewares, handler)(createPageMiddlewareContext(options));
}
