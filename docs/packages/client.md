# `duneta/client`

Framework React Router web — layered frontend lib.

## Layers

```text
duneta/client/ui        → Duneta* components (design system)
duneta/client/http      → BaseHttpService, HttpService, http instance
duneta/client/query     → React Query + useHttpQuery / useHttpMutation
duneta/client/form      → useDunetaForm (RHF + Zod validators)
duneta/client/feedback  → DunetaHttpErrorView, DunetaAsyncBoundary
duneta/client/i18n      → useLocale, setClientLocale
duneta/client/helpers   → dayjs, cookie utils
duneta/client/providers → DunetaAppProviders, DunetaThemeProvider, DunetaQueryProvider
duneta/client/image    → DunetaImage (giống next/image)
duneta/client/script   → DunetaScript (giống next/script)
duneta/client/router    → Link hooks, meta, createHttpLoader
duneta/client/core      → cn, constants
duneta/client/validators → Zod schema factories
duneta/client/configs   → duneta.client.config.ts (Vite / sync)
starter/                 → default routers + layouts (sync only)
```

## UI (`duneta/client/ui`)

HeroUI v3 wrappers as `Duneta*`:

```tsx
import { DunetaButton, DunetaCard } from 'duneta/client/ui';
import { DunetaTabs } from 'duneta/client/ui/DunetaTabs';
import { DunetaToast, showDunetaToast } from 'duneta/client/ui';

showDunetaToast.success('Saved');
```

`showDunetaToast` imperative API nằm trong `components/DunetaToast/` (cùng pattern `DunetaAlertDialog`).

Source lives in `packages/client/components/` (compiled to `dist/components/`).

Regenerate HeroUI wrappers:

```bash
pnpm --filter duneta/client generate:ui
```

## HTTP (`duneta/client/http`)

`BaseHttpService` abstract class + default `http` instance. Override hooks when you need auth headers, error mapping, etc.

```ts
import { BaseHttpService, http, HttpError } from 'duneta/client/http';

// Default — config.api.baseUrl, credentials: same-origin, headers below
const health = await http.json<{ ok: boolean }>('/health');

// JSON body + query params + custom headers (override defaults per call)
await http.post('/posts', {
  params: { draft: false },
  json: { title: 'Hello' },
  headers: { 'X-Request-Id': 'my-trace-id' },
});

// Stream / file / blob
const stream = await http.stream('/events');
const { blob, filename } = await http.download('/export.csv');
await http.upload('/avatar', { file, fieldName: 'avatar', data: { userId: '1' } });

// Custom service
class AppHttp extends BaseHttpService {
  protected getBaseUrl() {
    return '/api';
  }

  protected async onRequest(_url, init) {
    const headers = new Headers(init.headers);
    headers.set('Authorization', `Bearer ${token}`);
    return { ...init, headers };
  }
}

const appHttp = new AppHttp();
```

| Method | `responseType` |
|--------|----------------|
| `json()` | `json` |
| `text()` | `text` |
| `blob()` | `blob` |
| `stream()` | `stream` |
| `download()` | `blob` + `Content-Disposition` filename |
| `upload()` | `multipart/form-data` |
| `request()` | `auto` (infer from `Content-Type`) |

Default per request: `Accept: application/json`, `X-Duneta-Timezone` (browser TZ), `X-Request-Id` (UUID), `credentials: same-origin` (auth cookies). `Accept-Language` is sent by the browser automatically.

CSRF preset (when server enables CSRF):

```ts
import { createCsrfHttpService } from 'duneta/client/http';

export const http = createCsrfHttpService();
```

Custom transport (axios, etc.):

```ts
import { createHttpService, createFetchTransport } from 'duneta/client/http';

const http = createHttpService({ transport: createFetchTransport(myFetch) });
```

## Query (`duneta/client/query`)

```tsx
import { Suspense } from 'react';
import { useHttpQuery, useHttpMutation } from 'duneta/client/query';

// Client fetch (default)
function HealthClient() {
  const { data, isLoading, error, refetch } = useHttpQuery<{ ok: boolean }>('/health');
}

// SSR — fetch trên server, hydrate cache trên client (cần <Suspense>)
function HealthSsr() {
  const { data } = useHttpQuery<{ ok: boolean }>('/health', { ssr: true });
}
```

`ssr: true` dùng `useSuspenseQuery` + pipeline dehydrate/hydrate (`entry.server` + `DunetaQueryProvider`). Bọc component trong `<Suspense>`.

| Option | Mô tả |
|--------|------|
| `ssr: true` | Prefetch server, hydrate cache (cần `<Suspense>`) |
| (default) | Fetch sau mount trên client |

**Chọn pattern fetch:**

| Mục tiêu | Dùng |
|----------|------|
| Interactive UI + cache/refetch | `useHttpQuery` (default) |
| SSR + React Query cache | `useHttpQuery({ ssr: true })` + `<Suspense>` |
| SSR đơn giản, `useLoaderData` | `createHttpLoader` từ `duneta/client/router` |

```tsx
const createPost = useHttpMutation({ path: '/posts', method: 'POST' });
```

Starter routers use a single root file: `layout.tsx` (document + providers + `Outlet`). See [web routes](../web/routes.md).

## Providers (`duneta/client/providers`)

```tsx
import { DunetaAppProviders, DunetaThemeProvider } from 'duneta/client/providers';
```

| Export | Mô tả |
|--------|------|
| `DunetaAppProviders` | Default app providers stack |
| `DunetaQueryProvider` | QueryClient + SSR hydrate |
| `DunetaThemeProvider` | next-themes provider (`useTheme`) |

```text
layout.tsx   → {children} + Scripts
layout.tsx   → DunetaAppProviders → Outlet → page
```

## Form (`duneta/client/form`)

```tsx
import { z } from 'zod';
import { dunetaFieldError, useDunetaForm } from 'duneta/client/form';
import { emailSchema, passwordSchema } from 'duneta/client/validators';

const schema = z.object({ email: emailSchema(), password: passwordSchema({ strong: true }) });

const { register, submit, formState } = useDunetaForm({
  schema,
  onSubmit: async (values) => { /* ... */ },
});
```

## i18n (`duneta/client/i18n`)

Locale list và default lấy từ `duneta.client.config.ts` → `locale.default`, `locale.supported`.

```ts
// duneta.client.config.ts
locale: { default: 'vi', supported: ['vi', 'en', 'ja'] },
```

```tsx
import { getLocaleConfig, useLocale } from 'duneta/client/i18n';

const { locale, setLocale, supportedLocales, defaultLocale } = useLocale();
```

## Feedback (`duneta/client/feedback`)

```tsx
import { DunetaHttpErrorView, DunetaAsyncBoundary } from 'duneta/client/feedback';

<DunetaHttpErrorView error={error} onRetry={refetch} />
```

Toast imperative API nằm cùng component — xem `DunetaToast` bên dưới.

## Image (`duneta/client/image`)

```tsx
import {
  DunetaImage,
  createDunetaImageLoader,
  dunetaPassthroughImageLoader,
} from 'duneta/client/image';
```

| Export | Mô tả |
|--------|------|
| `DunetaImage` | Responsive image + optimization loader (`/duneta/image`) |
| `createDunetaImageLoader` | Loader mặc định qua route optimize |
| `dunetaPassthroughImageLoader` | Bỏ qua optimize (blob/data URL) |

## Script (`duneta/client/script`)

```tsx
import { DunetaScript } from 'duneta/client/script';
```

| Export | Mô tả |
|--------|------|
| `DunetaScript` | Third-party scripts (`afterInteractive` / `lazyOnload`) |

## Router (`duneta/client/router`)

```tsx
import { DunetaLink } from 'duneta/client/ui';
import { defineMeta, createDynamicComponent, useRouter } from 'duneta/client/router';
```

| Export | Mô tả |
|--------|------|
| `defineMeta` / `createPageMeta` | React Router meta |
| `createDynamicComponent` | Lazy import + fallback |
| `useRouter`, `usePathname`, … | Navigation hooks |
| `createHttpLoader` | Tạo React Router `loader` fetch JSON (`useLoaderData`) |

```ts
export const loader = createHttpLoader<Post[]>('/api/posts');
```

## Core (`duneta/client/core`)

```ts
import { cn, IMAGE_OPTIMIZATION_PATH } from 'duneta/client/core';
```

## Validators (`duneta/client/validators`)

Zod schema factories — import all or by category:

```text
validators/
  types/       → FieldMessageOptions, PasswordSchemaOptions, …
  string/      → base, email, identity, web, search
  number/      → integer, pagination
  auth/        → password, otp, passwordsMatch, acceptedTerms
  scalar/      → boolean, uuid, date
```

```ts
import { z } from 'zod';
import {
  displayNameSchema,
  emailSchema,
  passwordSchema,
  passwordsMatch,
} from 'duneta/client/validators';

// Or granular imports:
import { emailSchema } from 'duneta/client/validators/string';
import { passwordSchema, passwordsMatch } from 'duneta/client/validators/auth';

const signupSchema = z
  .object({
    name: displayNameSchema({ label: 'Full name', max: 80 }),
    email: emailSchema({ message: 'Email không hợp lệ' }),
    password: passwordSchema({ min: 10, strong: true }),
    confirmPassword: z.string(),
  })
  .superRefine(passwordsMatch({ message: 'Mật khẩu không khớp' }));
```

## Config

| Path | Nội dung |
|------|----------|
| `duneta/client/configs` | Web config |
| `duneta/client/configs/vite` | `createDunetaViteConfig` |
| `duneta/client/themes/globals.css` | Tailwind + HeroUI entry |

## Starter (not a public import)

`starter/routers` + `starter/layouts` — merged into `app/.router-runtime/` by `duneta sync`.
