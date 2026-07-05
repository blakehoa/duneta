# Client-side layers (`duneta/*`)

Framework React Router web — layered frontend lib, part of the single `duneta` package.

## Layers

```text
duneta/views/component        → Duneta* components (design system)
duneta/http      → BaseHttpService, HttpService, http instance
duneta/query     → React Query + useHttpQuery / useHttpMutation
duneta/views/form      → useDunetaForm (RHF + Zod validators)
duneta/views/feedback  → DunetaHttpErrorView, DunetaAsyncBoundary
duneta/i18n      → useLocale, setClientLocale
duneta/helpers   → dayjs, cookie utils
duneta/views/providers → DunetaAppProviders, DunetaThemeProvider, DunetaQueryProvider
duneta/views/image    → DunetaImage (giống next/image)
duneta/views/script   → DunetaScript (giống next/script)
duneta/views/router    → Link hooks, meta, createHttpLoader
duneta/core      → cn, constants
duneta/validators → Zod schema factories
duneta/config/client → config/client.ts (Vite / sync)
starter/                 → default routers + layouts (sync only)
```

## UI (`duneta/views/component`)

HeroUI v3 wrappers as `Duneta*`:

```tsx
import { DunetaButton, DunetaCard } from 'duneta/views/component';
import { DunetaTabs } from 'duneta/views/component/DunetaTabs';
import { DunetaToast, showDunetaToast } from 'duneta/views/component';

showDunetaToast.success('Saved');
```

`showDunetaToast` imperative API nằm trong `components/DunetaToast/` (cùng pattern `DunetaAlertDialog`).

Source lives in `packages/duneta/components/` (compiled to `dist/components/`).

Regenerate HeroUI wrappers:

```bash
pnpm --filter duneta generate:ui
```

## HTTP (`duneta/http`)

`BaseHttpService` abstract class + default `http` instance. Override hooks when you need auth headers, error mapping, etc.

```ts
import { BaseHttpService, http, HttpError } from 'duneta/http';

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
import { createCsrfHttpService } from 'duneta/http';

export const http = createCsrfHttpService();
```

Custom transport (axios, etc.):

```ts
import { createHttpService, createFetchTransport } from 'duneta/http';

const http = createHttpService({ transport: createFetchTransport(myFetch) });
```

## Query (`duneta/query`)

```tsx
import { Suspense } from 'react';
import { useHttpQuery, useHttpMutation } from 'duneta/query';

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
| SSR đơn giản, `useLoaderData` | `createHttpLoader` từ `duneta/views/router` |

```tsx
const createPost = useHttpMutation({ path: '/posts', method: 'POST' });
```

Starter routers use a single root file: `layout.tsx` (document + providers + `Outlet`). See [web routes](../web/routes.md).

## Providers (`duneta/views/providers`)

```tsx
import { DunetaAppProviders, DunetaThemeProvider } from 'duneta/views/providers';
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

## Form (`duneta/views/form`)

```tsx
import { z } from 'zod';
import { dunetaFieldError, useDunetaForm } from 'duneta/views/form';
import { emailSchema, passwordSchema } from 'duneta/validators';

const schema = z.object({ email: emailSchema(), password: passwordSchema({ strong: true }) });

const { register, submit, formState } = useDunetaForm({
  schema,
  onSubmit: async (values) => { /* ... */ },
});
```

## i18n (`duneta/i18n`)

Locale list và default lấy từ `config/client.ts` → `locale.default`, `locale.supported`.

```ts
// config/client.ts
locale: { default: 'vi', supported: ['vi', 'en', 'ja'] },
```

```tsx
import { getLocaleConfig, useLocale } from 'duneta/i18n';

const { locale, setLocale, supportedLocales, defaultLocale } = useLocale();
```

## Feedback (`duneta/views/feedback`)

```tsx
import { DunetaHttpErrorView, DunetaAsyncBoundary } from 'duneta/views/feedback';

<DunetaHttpErrorView error={error} onRetry={refetch} />
```

Toast imperative API nằm cùng component — xem `DunetaToast` bên dưới.

## Image (`duneta/views/image`)

```tsx
import {
  DunetaImage,
  createDunetaImageLoader,
  dunetaPassthroughImageLoader,
} from 'duneta/views/image';
```

| Export | Mô tả |
|--------|------|
| `DunetaImage` | Responsive image + optimization loader (`/duneta/views/image`) |
| `createDunetaImageLoader` | Loader mặc định qua route optimize |
| `dunetaPassthroughImageLoader` | Bỏ qua optimize (blob/data URL) |

## Script (`duneta/views/script`)

```tsx
import { DunetaScript } from 'duneta/views/script';
```

| Export | Mô tả |
|--------|------|
| `DunetaScript` | Third-party scripts (`afterInteractive` / `lazyOnload`) |

## Router (`duneta/views/router`)

```tsx
import { DunetaLink } from 'duneta/views/component';
import { defineMeta, createDynamicComponent, useRouter } from 'duneta/views/router';
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

## Core (`duneta/core`)

```ts
import { cn, IMAGE_OPTIMIZATION_PATH } from 'duneta/core';
```

## Validators (`duneta/validators`)

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
} from 'duneta/validators';

// Or granular imports:
import { emailSchema } from 'duneta/validators/string';
import { passwordSchema, passwordsMatch } from 'duneta/validators/auth';

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
| `duneta/config/client` | Web config |
| `duneta/vite` | `createDunetaViteConfig` |
| `duneta/views/theme/globals.css` | Tailwind + HeroUI entry |

## Starter (not a public import)

`starter/routers` + `starter/layouts` — merged into `app/.router-runtime/` by `duneta dev` / `duneta build`.
