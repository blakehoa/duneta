# Services (DI)

```ts
import { defineServices } from 'duneta/server/container';
import { UserRepository } from 'duneta/server/repositories';

export const registerServices = defineServices({
  repositories: {
    UserRepository,
  },
  controllers: {
    HealthController,
    MeController,
    UserController: ({ repositories }) =>
      new UserController(repositories.resolve(UserRepository)),
  },
});
```

- **Class** (`UserRepository`, `HealthController`) → `new Class()` tự động
- **Factory** `(ctx) => instance` — khi cần inject deps hoặc config
- **`resolve(UserRepository)`** hoặc **`resolve('UserRepository')`** — cùng key (tên class)

Instance tạo **một lần** lúc boot.
