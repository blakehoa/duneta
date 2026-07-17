# Dogfood

Canonical Duneta app for local Worker + Cloudflare production.

Features in `config/server.ts` are **off** by default. Turn on `database` / `auth` / … when needed, and uncomment matching Hyperdrive bindings in wrangler.

## Local

```bash
cp .env.example .env
pnpm --filter dogfood dev
```

Uses `wrangler.jsonc`.

## Production (features off — current)

```bash
# set vars.AUTH_BASE_URL in wrangler.production.jsonc
pnpm --filter dogfood deploy
```

## Production (with database)

1. `config/server.ts` → `database.enabled: true` + `postgres('HYPERDRIVE')`
2. Uncomment `hyperdrive` in `wrangler.jsonc` (local) and `wrangler.production.jsonc` (real id)
3. `wrangler secret put AUTH_SECRET` / `CSRF_SECRET` if auth/csrf enabled
4. `pnpm --filter dogfood deploy`

`duneta deploy` aborts if generated config still has `localConnectionString` or a placeholder Hyperdrive id.
