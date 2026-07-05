import type { EntryContext, RouterContextProvider } from 'react-router';
import { ServerRouter } from 'react-router';
import { renderToReadableStream } from 'react-dom/server';
import { createDunetaQueryClient } from 'duneta/query';
import {
  DunetaServerQueryProvider,
  finalizeSsrQueryResponse,
} from 'duneta/query/ssr-server';
import {
  createPageRequestIdMiddleware as createRequestIdMiddleware,
  createPageSecurityHeadersMiddleware as createSecurityHeadersMiddleware,
  runPageMiddlewares,
} from 'duneta/middleware/page';
import { collectWebRouteMiddlewares } from 'duneta/routes';
import { pageRouter } from './routes.manifest';

export const streamTimeout = 5_000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext: RouterContextProvider,
) {
  const middlewareContext = {
    request,
    responseHeaders,
    responseStatusCode,
    loadContext,
  };

  return runPageMiddlewares(
    middlewareContext,
    [
      createRequestIdMiddleware(),
      createSecurityHeadersMiddleware(),
      ...collectWebRouteMiddlewares(pageRouter, {
        ...middlewareContext,
        url: new URL(request.url),
        locals: {},
      }),
    ],
    async (context) => {
      if (context.request.method.toUpperCase() === 'HEAD') {
        return new Response(null, {
          status: context.responseStatusCode,
          headers: context.responseHeaders,
        });
      }

      let shellRendered = false;
      const queryClient = createDunetaQueryClient();

      const body = await renderToReadableStream(
        <DunetaServerQueryProvider client={queryClient}>
          <ServerRouter context={routerContext} url={context.request.url} />
        </DunetaServerQueryProvider>,
        {
          onError(error: unknown) {
            context.responseStatusCode = 500;
            if (shellRendered) {
              console.error(error);
            }
          },
        },
      );
      shellRendered = true;

      await body.allReady;

      context.responseHeaders.set('Content-Type', 'text/html');
      const dehydratedBody = finalizeSsrQueryResponse(body, queryClient);

      return new Response(dehydratedBody ?? body, {
        headers: context.responseHeaders,
        status: context.responseStatusCode,
      });
    },
  );
}
