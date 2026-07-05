# API app (`routes/api.ts` + `app/http/controllers`)

## Cấu trúc

```text
routes/
└── api.ts
app/
├── providers/app-service-provider.ts
└── http/controllers/
```

Config web: `config/client.ts`. API: `config/server.ts` (lazy load trong worker).

App scaffold (`create-duneta-app`): `routes/api.ts` chỉ routes tối thiểu. DB/auth là opt-in — xem [Kiến trúc](../architecture.md).

## Entry

API bootstrap trong `worker.ts` — `createDunetaWorker()` tự load `routes/api.ts` + `app/providers/app-service-provider.ts`.

## Hooks

| Hook | File | Vai trò |
|------|------|---------|
| `registerServices` | `app/providers/app-service-provider.ts` | DI controllers + repositories |
| `api routes` | `routes/api.ts` | Route groups |
| `resolvePermissions` | `app/providers/app-service-provider.ts` | Grants / roles sau login |

Chi tiết: [services](./services.md), [sync](./sync.md), [runtime](./runtime.md).
