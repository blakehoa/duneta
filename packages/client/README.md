# duneta-client

Browser-safe utilities and React Router web kit for Duneta applications.

Import as `duneta/client/*` — the npm package name is `duneta-client`, but code uses the `duneta/client` path (via package exports and Vite/tsconfig aliases in Duneta apps).

## Install

```bash
npm install duneta-client
```

For a new full-stack app, prefer [`duneta`](https://www.npmjs.com/package/duneta) or [`create-duneta-app`](https://www.npmjs.com/package/create-duneta-app) instead.

## Layers

| Import | Contents |
|--------|----------|
| `duneta/client/ui` | `Duneta*` components (HeroUI v3 wrappers) |
| `duneta/client/http` | `BaseHttpService`, `http` instance |
| `duneta/client/query` | React Query hooks |
| `duneta/client/form` | `useDunetaForm` (RHF + Zod) |
| `duneta/client/feedback` | Error views, async boundaries |
| `duneta/client/i18n` | Locale helpers |
| `duneta/client/providers` | App, theme, query providers |
| `duneta/client/router` | Link hooks, loaders, meta |
| `duneta/client/core` | `cn`, constants |
| `duneta/client/validators` | Zod schema factories |
| `duneta/client/configs` | Client config bootstrap |

## Example

```tsx
import { DunetaButton } from 'duneta/client/ui';
import { http } from 'duneta/client/http';
import { DunetaAppProviders } from 'duneta/client/providers';

const health = await http.json<{ ok: boolean }>('/api/health');
```

## Related

- [`duneta`](https://www.npmjs.com/package/duneta) — CLI + bundled client & server
- [`duneta-server`](https://www.npmjs.com/package/duneta-server) — server utilities

## License

MIT
