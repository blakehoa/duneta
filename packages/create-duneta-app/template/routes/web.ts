import { WebRoute } from 'duneta/routes';

export default {
  pages: [
    WebRoute.define({
      path: '/',
      layout: 'layout.tsx',
      page: 'page.tsx',
    }),
    WebRoute.define({
      path: '/admin',
      layout: 'admin/layout.tsx',
      page: 'admin/page.tsx',
      middleware: [
        async (context, next) => {
          context.locals.section = 'admin';
          return next();
        },
      ],
    }),
    WebRoute.define({
      path: '/post/:id',
      layout: 'post/layout.tsx',
      page: 'post/page.tsx',
      middleware: [
        async (context, next) => {
          context.locals.section = 'post';
          return next();
        },
      ],
    }),
  ],
} satisfies WebRoute.Config;
