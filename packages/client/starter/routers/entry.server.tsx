import type { EntryContext, RouterContextProvider } from 'react-router';
import { ServerRouter } from 'react-router';
import { renderToReadableStream } from 'react-dom/server';
import { createDunetaQueryClient } from 'duneta/client/query';
import {
  DunetaServerQueryProvider,
  finalizeSsrQueryResponse,
} from 'duneta/client/query/ssr-server';

export const streamTimeout = 5_000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext: RouterContextProvider,
) {
  void loadContext;
  if (request.method.toUpperCase() === 'HEAD') {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders,
    });
  }

  let shellRendered = false;
  const queryClient = createDunetaQueryClient();

  const body = await renderToReadableStream(
    <DunetaServerQueryProvider client={queryClient}>
      <ServerRouter context={routerContext} url={request.url} />
    </DunetaServerQueryProvider>,
    {
      onError(error: unknown) {
        responseStatusCode = 500;
        if (shellRendered) {
          console.error(error);
        }
      },
    },
  );
  shellRendered = true;

  await body.allReady;

  responseHeaders.set('Content-Type', 'text/html');
  const dehydratedBody = finalizeSsrQueryResponse(body, queryClient);

  return new Response(dehydratedBody ?? body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
