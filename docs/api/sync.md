# Sync convention

Codegen không còn tạo `services.ts/router.ts`; app dùng layout Laravel-style với `routes/api.ts` + `app/providers/app-service-provider.ts`.

## Manual (khuyến nghị)

```text
routes/
  api.ts                      → API route registry
app/
  providers/app-service-provider.ts → registerServices + resolvePermissions
  http/controllers/*          → controllers + route groups
```
