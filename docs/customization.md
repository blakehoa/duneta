# Hướng dẫn customize

Tóm tắt **chỗ nào sửa** cho từng nhu cầu — không cần đụng `packages/` trừ khi đóng góp framework.

## Ma trận customize

| Muốn làm                   | File / hook                             | Doc                                  |
| -------------------------- | --------------------------------------- | ------------------------------------ |
| Đổi port, DB, auth, cache  | `.env` + `duneta.server.config.ts`      | [Configuration](../configuration.md) |
| Thêm controller/repository | `app/api/controllers/`, `repositories/` | [Sync](./api/sync.md)                |
| Thêm API route             | `app/api/routers/*.routes.ts`           | [Sync](./api/sync.md)                |
| Deploy Worker              | `wrangler.jsonc` + `worker.ts`          | [Deploy](../deployment.md)           |
| Thêm web page              | `app/pages/`                            | [Web pages](../web/routes.md)        |
| Đổi theme                  | `duneta.client.config.ts`               | [Web overview](../web/overview.md)   |

## Workflow: thêm feature API mới

Ví dụ: `GET /api/posts`

### 1. Schema (nếu table mới)

```ts
// app/api/repositories/schemas/post.ts
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const post = pgTable('post', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### 2. Repository

```ts
// app/api/repositories/post-repository.ts
import { BaseRepository } from 'duneta/server/http';
import { post } from './schemas/post';

export class PostRepository extends BaseRepository<typeof post> {
  constructor() {
    super(post);
  }
}
```

### 3. Controller

```ts
// app/api/controllers/post-controller.ts
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
// app/api/routers/posts.routes.ts
import { defineGroup } from 'duneta/server/routers';
import { resolveController } from 'duneta/server/http';
import { requireSession } from 'duneta/server/middlewares';

export const postsRoutes = defineGroup({
  path: '/posts',
  middleware: [requireSession()],
  endpoints: [
    { method: 'GET', handler: resolveController('PostController', 'index') },
  ],
});
```

`pnpm build` tự sync API (DI + merge routes) — hoặc chỉnh `api/services.ts` / `api/router.ts` thủ công.

### 5. Dev

```bash
pnpm dev
```

### 6. Typecheck

Thêm path vào `app/api/tsconfig.json` nếu tạo thư mục mới:

```json
"include": ["api/**/*.ts", "duneta.client.config.ts", "duneta.server.config.ts", "services", "routers", "permissions", "controllers", "repositories"]
```

Override trong `api/services.ts` — đăng ký lại cùng key:

```ts
ctx.controllers.singleton('UserController', () => new MyUserController(...));
```

## Workflow: dùng route build sẵn

Framework ship sẵn trong `duneta/server/routers` — user chọn mount trong `app/api/router.ts`:

| Route group | Cần config | Cần register |
|-------------|------------|--------------|
| `healthRoutes` | — | `HealthController` |
| `meRoutes` | `auth.enabled: true` | `MeController` |
| `createUsersRoutes()` | `auth.enabled: true`, `database.enabled: true` | `UserController`, `UserRepository` |
| `createStorageRoutes()` | `storage.enabled: true` | `StorageController` (hoặc subclass) |

App mới chỉ mount `healthRoutes`. Thêm group = bật config + register service tương ứng.

## Workflow: web page gọi API mới

```tsx
// app/pages/posts/page.tsx
import { useLoaderData } from 'react-router';
import { http } from 'duneta/client/http';

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

1. **`.env`** — secret values · **`duneta.server.config.ts`** — map `process.env.*` · **`duneta.client.config.ts`** — web
2. **Một Worker** — `worker.ts` route web + API
3. **Convention + sync** — thêm `*-controller.ts`, `*-repository.ts`, `*.routes.ts`
4. **Repository trước, Controller sau** — sync tự match theo base name
5. **Arrow methods** trên controller cho `resolveController`

## Đọc thêm

- [Kiến trúc](../architecture.md)
- [API overview](./api/overview.md)
- [Controller → Repository](./api/controllers-repositories.md)
