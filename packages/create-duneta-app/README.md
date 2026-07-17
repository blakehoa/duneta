# create-duneta-app

Scaffold a new Duneta full-stack Cloudflare Workers project.

## Usage

```bash
npx create-duneta-app my-app
cd my-app
npm install
npm run dev
```

Scaffold into the current directory:

```bash
npx create-duneta-app .
```

Overwrite an existing directory:

```bash
npx create-duneta-app my-app --force
```

## What you get

- React Router 7 web app (`app/pages/` + `routes/web.ts`)
- Hono API on the same Worker (`routes/api.ts` + `app/http/controllers/` with `ApiRoute.define`)
- `duneta` CLI for dev, build, and deploy
- `config/client.ts` and `config/server.ts`
- Wrangler config for Cloudflare Workers
- `.npmrc` with pnpm hoist settings (see below)

```json
{
  "scripts": {
    "prepare": "duneta prepare",
    "dev": "duneta dev",
    "build": "duneta build",
    "deploy": "duneta deploy"
  },
  "dependencies": {
    "duneta": "^1.0.3",
    "react": "^19.2.7",
    "react-dom": "^19.2.7"
  }
}
```

Dev server: `http://localhost:8787` (HMR).

## pnpm

The scaffold includes an `.npmrc` that forces a hoisted `node_modules` layout:

```
node-linker=hoisted
public-hoist-pattern[]=*
```

Duneta (and tools it shells to — Wrangler, Vite, tsx) expect flat resolution. Keep this file if you use pnpm; it is harmless for npm and yarn.

## Requirements

- Node.js ≥ 22.22
- Cloudflare account for deploy (`wrangler login` or `CLOUDFLARE_API_TOKEN`)

## Related packages

| npm | Role |
|-----|------|
| [`duneta`](https://www.npmjs.com/package/duneta) | CLI + bundled client & server |

## License

MIT
