import type { DunetaPageRoutes } from 'duneta/middleware/page';

export default {
  pages: [
    { path: '/', layout: 'layout.tsx', page: 'page.tsx' },
    {
      path: '/admin',
      layout: 'admin/layout.tsx',
      page: 'admin/page.tsx',
      middleware: [
        async (context, next) => {
          context.locals.section = 'admin';
          return next();
        },
      ],
    },
    {
      path: '/post/:id',
      layout: 'post/layout.tsx',
      page: 'post/page.tsx',
      middleware: [
        async (context, next) => {
          context.locals.section = 'post';
          return next();
        },
      ],
    },
  ],
} satisfies DunetaPageRoutes;
