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

export type DunetaPageRoute<TLoadContext = unknown> = {
  path: DunetaPathMatcher;
  middleware?: DunetaPageMiddleware<TLoadContext> | DunetaPageMiddleware<TLoadContext>[];
  layout?: string;
  page?: string;
  children?: DunetaPageRoute<TLoadContext>[];
};

export type DunetaPageRouter<TLoadContext = unknown> = {
  routes: DunetaPageRoute<TLoadContext>[];
};

/** Page half of `app/routes.ts` (SSR / React Router). */
export type DunetaPageRoutes<TLoadContext = unknown> = {
  pages?: DunetaPageRoute<TLoadContext>[];
};
