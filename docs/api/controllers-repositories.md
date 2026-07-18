# Controller → Repository

## Layer

```text
HTTP Request
    ↓
Route (ApiRoute.define + resolveController)
    ↓
Controller (BaseController)
    ↓
Repository (BasePgRepository)
    ↓
Drizzle → Postgres
```

## BaseController

`packages/duneta/http/controllers/base-controller.ts`

Helpers có sẵn:

| Method                                       | Mô tả               |
| -------------------------------------------- | ------------------- |
| `json(c, data, status?)`                     | JSON response       |
| `notFound(c, message?)`                      | 404                 |
| `unauthorized(c, message?)`                  | 401                 |
| `userId(c)`                                  | userId từ context   |
| `resolveSession(c)`                          | Better Auth session |
| `locale(c)` / `timezone(c)` / `requestId(c)` | request metadata    |

### Ví dụ controller

```ts
// app/http/controllers/PostController.ts
import type { Context } from 'hono';
import { BaseController } from 'duneta/http';
import type { RequestContext } from 'duneta/middleware/http';
import type { PostRepository } from '../../Repositories/PostRepository';

export class PostController extends BaseController {
  constructor(private readonly posts: PostRepository) {
    super();
  }

  index = async (c: Context<RequestContext>) => {
    return this.json(c, { data: await this.posts.findAll() });
  };

  show = async (c: Context<RequestContext>) => {
    const post = await this.posts.findById(c.req.param('id'));
    if (!post) return this.notFound(c);
    return this.json(c, { data: post });
  };
}
```

Handler phải là **arrow function property** (`index = async (c) =>`) để `resolveController` gọi đúng `this`.

## BaseRepository và BasePgRepository

`packages/duneta/http/repositories/`

`BaseRepository` chỉ cung cấp `await this.db(name?)` và không phụ thuộc driver.
`BasePgRepository` kiểm tra connection có `driver: 'postgres'` trước khi mở client,
sau đó cung cấp CRUD generic cho Drizzle PostgreSQL table có cột `id`:

| Method               | Mô tả            |
| -------------------- | ---------------- |
| `findAll()`          | SELECT \*        |
| `findById(id)`       | SELECT WHERE id  |
| `create(values)`     | INSERT RETURNING |
| `update(id, values)` | UPDATE RETURNING |
| `delete(id)`         | DELETE RETURNING |

### Ví dụ repository

```ts
// app/repositories/PostRepository.ts
import { BasePgRepository } from 'duneta/http/repositories';
import { post } from './Schemas/Post';

export class PostRepository extends BasePgRepository<typeof post> {
  constructor() {
    super(post);
  }

  async findPublished() {
    const db = await this.db();
    return db.select().from(post).where(eq(post.published, true));
  }
}
```

`await this.db()` mở client **lazy** cho request/scheduled invocation hiện tại —
connection chỉ connect khi repository thật sự cần, và mọi repository trong cùng
request dùng chung một client cho mỗi connection name (Repo1 gọi Repo2 không mở thêm).

Nếu repository dùng database mặc định:

```ts
export class PostRepository extends BasePgRepository<typeof post> {
  constructor() {
    super(post);
  }
}
```

Nếu repository dùng connection khác trong `database.connections`, khai báo bằng
`databases`; phần tử đầu tiên là mặc định của repository:

```ts
// một connection duy nhất
export class AnalyticsRepository extends BasePgRepository<typeof event> {
  protected readonly databases = ['analytics'] as const;

  constructor() {
    super(event);
  }
}

// nhiều connection — this.db() mặc định 'primary', this.db('analytics') khi cần
export class ReportRepository extends BasePgRepository<typeof report> {
  protected readonly databases = ['primary', 'analytics'] as const;

  constructor() {
    super(report);
  }

  async findRaw() {
    const db = await this.db('analytics');
    return db.select().from(report);
  }
}
```

Gọi `this.db(name)` với tên chưa khai báo sẽ throw. Repository có thể là singleton —
client không giữ toàn cục mà thuộc về request hoặc cron invocation hiện tại. Framework
đóng client sau khi handler xong **và** mọi `waitUntil` task đã settle — nên background
work đăng ký qua `waitUntil` vẫn dùng được DB.

Streaming / callback query **sau** khi handler return mà không gắn vào `waitUntil` sẽ
thấy scope đã đóng. Mọi DB work kéo dài hơn response phải đi qua `c.executionCtx.waitUntil(...)`
(HTTP) hoặc `ctx.waitUntil(...)` (cron).

Schema Drizzle đặt trong `repositories/schemas/` hoặc `packages/duneta/repositories/schemas/` (auth schema ship sẵn).

## Đăng ký + route — checklist

1. Tạo schema Drizzle (nếu table mới)
2. Tạo `PostRepository extends BasePgRepository`
3. Tạo `PostController extends BaseController`
4. Đăng ký trong `app/providers/app-service-provider.ts`
5. Thêm `ApiRoute.define` trong `app/http/controllers/*/routes.ts`
6. Gắn export vào `routes/api.ts` (`api: [postRoutes]`)

### Ví dụ route group

```ts
// app/http/controllers/Post/routes.ts
import { ApiRoute } from 'duneta/routes';
import { resolveController } from 'duneta/http';

export const postRoutes = ApiRoute.define({
  path: '/posts',
  endpoints: [
    { method: 'GET', handler: resolveController('PostController', 'index') },
    {
      method: 'GET',
      path: '/:id',
      handler: resolveController('PostController', 'show'),
    },
  ],
});
```

## Auth trong controller

```ts
show = async (c: Context<RequestContext>) => {
  const session = await this.resolveSession(c);
  if (!session) return this.unauthorized(c);
  // ...
};
```

Hoặc dùng `requireSession()` middleware trên route group.

## Không có Service layer

Logic nghiệp vụ phức tạp có thể:

- Đặt trong repository (query phức tạp)
- Tạo service class riêng và inject vào controller qua `providers`
- Giữ trong controller nếu đơn giản

Framework không ép service layer — tùy quy mô app.
