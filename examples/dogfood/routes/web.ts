import type { DunetaPageMiddleware, DunetaPageRoutes } from 'duneta/middleware/page';

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
    {
      path: '/',
      layout: 'layout.tsx',
      page: 'page.tsx',
      middleware: [appMiddleware],
    },
    { path: '/about', layout: 'layout.tsx', page: 'about/page.tsx' },
    { path: '/datatable', layout: 'layout.tsx', page: 'datatable/page.tsx' },
    {
      path: '/post/:id',
      layout: 'post/layout.tsx',
      page: 'post/page.tsx',
      middleware: [
        async (context, next) => {
          context.locals.route = 'post-detail';
          return next();
        },
      ],
    },
  ],
} satisfies DunetaPageRoutes;
