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

```json
{
  "scripts": {
    "dev": "duneta dev",
    "build": "duneta build",
    "deploy": "duneta deploy"
  },
  "dependencies": {
    "duneta": "^0.1.2",
    "react": "^19.2.7",
    "react-dom": "^19.2.7"
  }
}
```

Dev server: `http://localhost:8787` (HMR).

## Requirements

- Node.js ≥ 22.22
- Cloudflare account for deploy (`wrangler login` or `CLOUDFLARE_API_TOKEN`)

## Related packages

| npm | Role |
|-----|------|
| [`duneta`](https://www.npmjs.com/package/duneta) | CLI + bundled client & server |

## License

MIT
