import { WebRoute } from 'duneta/routes';
import type { DunetaPageMiddleware } from 'duneta/middleware/page';

const appMiddleware: DunetaPageMiddleware = async (_context, next) => {
  const response = await next();
  const headers = new Headers(response.headers);
  headers.set('X-App-Middleware', 'enabled');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export default {
  pages: [
    WebRoute.define({
      path: '/',
      layout: 'layout.tsx',
      page: 'page.tsx',
      middleware: [appMiddleware],
    }),
    WebRoute.define({
      path: '/about',
      layout: 'layout.tsx',
      page: 'about/page.tsx',
    }),
    WebRoute.define({
      path: '/datatable',
      layout: 'layout.tsx',
      page: 'datatable/page.tsx',
    }),
    WebRoute.define({
      path: '/post/:id',
      layout: 'post/layout.tsx',
      page: 'post/page.tsx',
      middleware: [
        async (context, next) => {
          context.locals.route = 'post-detail';
          return next();
        },
      ],
    }),
  ],
} satisfies WebRoute.Config;
