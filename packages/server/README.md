# duneta-server

Server utilities for Duneta applications.

Hono API toolkit for Cloudflare Workers: routing, DI, auth, permissions, middleware, and database helpers.

Import as `duneta/server/*` — the npm package name is `duneta-server`, but code uses the `duneta/server` path.

## Install

```bash
npm install duneta-server
```

For a new full-stack app, prefer [`duneta`](https://www.npmjs.com/package/duneta) or [`create-duneta-app`](https://www.npmjs.com/package/create-duneta-app) instead.

## Exports

| Import | Contents |
|--------|----------|
| `duneta/server/runtime/worker` | `defineServer`, boot |
| `duneta/server/container` | Service registry, DI |
| `duneta/server/routers` | `composeRouter`, route groups |
| `duneta/server/http` | `BaseController`, `resolveController` |
| `duneta/server/middlewares` | Session, CSRF, rate-limit |
| `duneta/server/auth` | Better Auth integration |
| `duneta/server/permissions` | Policies, grants |
| `duneta/server/assembly` | `createHttpApp` |
| `duneta/server/configs` | Server config types |
| `duneta/server/scripts/sync-api` | API sync script |

## Example

```ts
import { defineServer } from 'duneta/server/runtime/worker';
import { composeRouter } from 'duneta/server/routers';
import { createHttpApp } from 'duneta/server/assembly';

export default defineServer({
  createApp: () => createHttpApp({ router: composeRouter([/* ... */]) }),
});
```

Optional modules (database, auth, cache) are enabled in `duneta.server.config.ts` — not required for a minimal health-check app.

## Related

- [`duneta`](https://www.npmjs.com/package/duneta) — CLI + bundled client & server
- [`duneta-client`](https://www.npmjs.com/package/duneta-client) — browser kit

## License

MIT
