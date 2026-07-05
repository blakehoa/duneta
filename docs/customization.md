# Hướng dẫn customize

Tóm tắt **chỗ nào sửa** cho từng nhu cầu — không cần đụng `packages/` trừ khi đóng góp framework.

## Ma trận customize

| Muốn làm                   | File / hook                             | Doc                                  |
| -------------------------- | --------------------------------------- | ------------------------------------ |
| Đổi port, DB, auth, cache  | `.env` + `config/server.ts`             | [Configuration](../configuration.md) |
| Thêm controller/repository | `app/http/controllers/`                  | [Sync](./api/sync.md)                |
| Thêm API route             | `routes/api.ts` + `app/http/controllers/*/routes.ts` | [Sync](./api/sync.md)                |
| Deploy Worker              | `wrangler.jsonc` + `worker.ts`          | [Deploy](../deployment.md)           |
| Thêm web page + middleware | `app/pages/` + `routes/web.ts` | [Web pages](../web/routes.md) |
| Đổi theme                  | `config/client.ts`                      | [Web overview](../web/overview.md)   |

## Workflow: thêm feature API mới

Ví dụ: `GET /api/posts`

### 1. Schema (nếu table mới)

```ts
// app/repositories/Schemas/Post.ts
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const post = pgTable('post', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### 2. Repository

```ts
// app/repositories/PostRepository.ts
import { BaseRepository } from 'duneta/http';
import { post } from './Schemas/Post';

export class PostRepository extends BaseRepository<typeof post> {
  constructor() {
    super(post);
  }
}
```

### 3. Controller

```ts
// app/http/controllers/PostController.ts
export class PostController extends BaseController {
  constructor(private readonly posts: PostRepository) {
    super();
  }

  index = async (c: Context<RequestContext>) => {
    return this.json(c, { data: await this.posts.findAll() });
  };
}
```

### 4. Routes

```ts
// app/http/controllers/Post/routes.ts
import { ApiRoute } from 'duneta/routes';
import { resolveController } from 'duneta/http';
import { requireSession } from 'duneta/middleware/http';

export const postsRoutes = ApiRoute.define({
  path: '/posts',
  middleware: [requireSession()],
  endpoints: [
    { method: 'GET', handler: resolveController('PostController', 'index') },
  ],
});
```

Mount trong `routes/api.ts`:

```ts
import type { ApiRoute } from 'duneta/routes';
import { postsRoutes } from '../app/http/controllers/post';

export default {
  api: [postsRoutes],
} satisfies ApiRoute.Config;
```

`pnpm build` lấy API từ `routes/api.ts` + `app/providers/app-service-provider.ts`.

### 5. Dev

```bash
pnpm dev
```

### 6. Typecheck

Thêm path vào `tsconfig.json` nếu tạo thư mục mới:

```json
"include": ["routes/**/*.ts", "config/**/*.ts", "app/**/*.ts", "app/**/*.tsx"]
```

Override trong `app/providers/app-service-provider.ts` — đăng ký lại cùng key:

```ts
ctx.controllers.singleton('UserController', () => new MyUserController(...));
```

## Workflow: dùng route build sẵn

Framework ship sẵn trong `duneta/routes` — user chọn mount trong `routes/api.ts`:

| Route group | Cần config | Cần register |
|-------------|------------|--------------|
| `healthRoutes` | — | `HealthController` |
| `meRoutes` | `auth.enabled: true` | `MeController` |
| `createUsersRoutes()` | `auth.enabled: true`, `database.enabled: true` | `UserController`, `UserRepository` |
| `createStorageRoutes()` | `storage.enabled: true` | `StorageController` (hoặc subclass) |

App mới chỉ mount `healthRoutes`. Thêm group = bật config + register service tương ứng.

## Workflow: thêm web page với middleware

### 1. Tạo page file

```tsx
// app/pages/admin/page.tsx
export default function AdminPage() {
  return <h1>Admin</h1>;
}
```

### 2. Khai báo trong `routes/web.ts`

```ts
import { WebRoute } from 'duneta/routes';
import type { DunetaPageMiddleware } from 'duneta/middleware/page';

const adminGuard: DunetaPageMiddleware = async (context, next) => {
  context.locals.section = 'admin';
  return next();
};

export default {
  pages: [
    WebRoute.define({
      path: '/admin',
      layout: 'layout.tsx',
      page: 'admin/page.tsx',
      middleware: [adminGuard],
    }),
  ],
} satisfies WebRoute.Config;
```

Restart `pnpm dev` để sync routers sau khi thêm route mới.

## Workflow: web page gọi API mới

```tsx
// app/pages/posts/page.tsx
import { useLoaderData } from 'react-router';
import { http } from 'duneta/http';

export async function loader() {
  return http.json('/posts');
}

export default function PostsPage() {
  const data = useLoaderData<typeof loader>();
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

Đảm bảo `pnpm dev` đang chạy — API same-origin tại `/api`.

## Nguyên tắc

1. **`.env`** — secret values · **`config/server.ts`** — map `process.env.*` · **`config/client.ts`** — web
2. **Một Worker** — `worker.ts` route web + API
3. **Convention + sync** — thêm `*-controller.ts`, `*-repository.ts`, `routes.ts` (`ApiRoute.define`)
4. **Repository trước, Controller sau** — sync tự match theo base name
5. **Arrow methods** trên controller cho `resolveController`

## Đọc thêm

- [Kiến trúc](../architecture.md)
- [API overview](./api/overview.md)
- [Controller → Repository](./api/controllers-repositories.md)
