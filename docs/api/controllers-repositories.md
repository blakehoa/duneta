# Controller → Repository

## Layer

```text
HTTP Request
    ↓
Route (defineGroup + resolveController)
    ↓
Controller (BaseController)
    ↓
Repository (BaseRepository)
    ↓
Drizzle → Postgres
```

## BaseController

`packages/server/http/base-controller.ts`

Helpers có sẵn:

| Method | Mô tả |
|--------|-------|
| `json(c, data, status?)` | JSON response |
| `notFound(c, message?)` | 404 |
| `unauthorized(c, message?)` | 401 |
| `userId(c)` | userId từ context |
| `resolveSession(c)` | Better Auth session |
| `locale(c)` / `timezone(c)` / `requestId(c)` | request metadata |

### Ví dụ controller

```ts
// app/api/controllers/post-controller.ts
import type { Context } from 'hono';
import { BaseController } from 'duneta/server/http';
import type { RequestContext } from 'duneta/server/middlewares';
import type { PostRepository } from '../repositories/post-repository';

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

## BaseRepository

`packages/server/http/base-repository.ts`

CRUD generic trên Drizzle table có cột `id`:

| Method | Mô tả |
|--------|-------|
| `findAll()` | SELECT * |
| `findById(id)` | SELECT WHERE id |
| `create(values)` | INSERT RETURNING |
| `update(id, values)` | UPDATE RETURNING |
| `delete(id)` | DELETE RETURNING |

### Ví dụ repository

```ts
// app/api/repositories/post-repository.ts
import { BaseRepository } from 'duneta/server/http';
import { post } from './schemas/post';

export class PostRepository extends BaseRepository<typeof post> {
  constructor() {
    super(post);
  }

  async findPublished() {
    return this.db.select().from(post).where(eq(post.published, true));
  }
}
```

`db` bind tự động lúc boot qua `BaseRepository.bindDb()` — repository chỉ cần truyền `table`.

Schema Drizzle đặt trong `repositories/schemas/` hoặc `packages/server/repositories/schemas/` (auth schema ship sẵn).

## Đăng ký + route — checklist

1. Tạo schema Drizzle (nếu table mới)
2. Tạo `PostRepository extends BaseRepository`
3. Tạo `PostController extends BaseController`
4. Đăng ký trong `api/services.ts`
5. Thêm `defineGroup` trong `routers/`
6. Gắn group vào `createAppRouter`

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
