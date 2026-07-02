# Storage

File: `packages/server/http/base-storage-controller.ts`

```text
StorageConfig → resolveBackend() → upload | head | delete
```

Drivers: `s3` · `r2` (Cloudflare R2, S3-compatible API) · `custom`

## Config

```ts
import { storage } from 'duneta/server/configs';

storage({
  driver: 'r2',
  config: {
    bucket: 'duneta',
    endpoint: 'https://<account_id>.r2.cloudflarestorage.com',
    accessKeyId: '...',
    secretAccessKey: '...',
    region: 'auto',
    publicUrl: 'https://cdn.example.com',
  },
}),
```

## DI

```ts
controllers.singleton('StorageController', () => new StorageController(config.storage));
```

## Routes

| Method | Path | Handler |
|--------|------|---------|
| POST | `/api/storage` | `store` |
| GET | `/api/storage/meta?key=` | `head` |
| DELETE | `/api/storage/objects?key=` | `destroy` |

## Extend

```ts
export class AppStorageController extends BaseStorageController {
  uploadAvatar(file: Blob) {
    return this.upload(file, { folder: 'avatars' });
  }
}
```

## Custom driver

```ts
registerObjectStore('minio', (config, opts) => minioBackend(config, opts));
```
