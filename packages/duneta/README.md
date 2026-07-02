# duneta

Full-stack React + Hono on Cloudflare Workers — dev, build, and deploy CLI.

Install `duneta` to get the CLI plus bundled `duneta/client` and `duneta/server` import paths in one package.

## Quick start

```bash
npx create-duneta-app my-app
cd my-app
npm install
npm run dev
```

## Install

```bash
npm install duneta
```

## Scripts

```json
{
  "scripts": {
    "dev": "duneta dev",
    "build": "duneta build",
    "deploy": "duneta deploy",
    "prepare": "duneta prepare"
  }
}
```

## Imports

| Path | Use in |
|------|--------|
| `duneta/client/*` | React Router web shell (`app/`) |
| `duneta/server/*` | Hono API (`app/api/`) |
| `duneta/vite` | Vite config re-export |

```ts
import { DunetaButton } from 'duneta/client/ui';
import { defineServer } from 'duneta/server/runtime/worker';
```

## Standalone packages

You can install client or server separately if you only need one side:

- [`duneta-client`](https://www.npmjs.com/package/duneta-client) — browser kit only
- [`duneta-server`](https://www.npmjs.com/package/duneta-server) — API utilities only

Import paths stay `duneta/client` and `duneta/server` in both layouts.

## Requirements

- Node.js ≥ 22.22
- Cloudflare Workers (Wrangler)

## License

MIT
