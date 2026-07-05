export type DunetaPageMiddlewareContext<TLoadContext = unknown> = {
  request: Request;
  url: URL;
  responseHeaders: Headers;
  responseStatusCode: number;
  loadContext?: TLoadContext;
  locals: Record<string, unknown>;
};

export type DunetaPageHandler<TLoadContext = unknown> = (
  context: DunetaPageMiddlewareContext<TLoadContext>,
) => Response | Promise<Response>;

export type DunetaPageMiddleware<TLoadContext = unknown> = (
  context: DunetaPageMiddlewareContext<TLoadContext>,
  next: () => Promise<Response>,
) => Response | Promise<Response>;

export type DunetaPathMatcher =
  | string
  | RegExp
  | ((pathname: string, context: DunetaPageMiddlewareContext) => boolean);
