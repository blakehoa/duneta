/**
 * Storage — một entry point: `BaseStorageController`.
 *
 * Flow:
 *   config/server.ts storage → constructor → resolveBackend() → put/head/delete
 *
 * Drivers:
 *   s3  — AWS S3, MinIO, …
 *   r2  — Cloudflare R2 (S3-compatible API, credentials trong config)
 *   custom — registerObjectStore()
 *
 * @example Cloudflare R2
 * ```ts
 * storage({
 *   driver: 'r2',
 *   config: {
 *     bucket: 'duneta',
 *     endpoint: 'https://<account_id>.r2.cloudflarestorage.com',
 *     accessKeyId: '...',
 *     secretAccessKey: '...',
 *     region: 'auto',
 *     publicUrl: 'https://cdn.example.com',
 *   },
 * })
 * ```
 *
 * DI: `new StorageController(config.storage)`
 * Routes: POST /api/storage · GET /api/storage/meta · DELETE /api/storage/objects
 */
import { AwsClient } from 'aws4fetch';
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type {
  CustomConfig,
  S3Config,
  StorageConfig,
} from '../../config/server/storage.js';
import { isStorageActive, storeOptions } from '../../config/server/storage.js';
import type { RequestContext } from '../../middleware/http/request-context.js';
import { HttpError } from '../../permission/errors.js';

type StoreBody = NonNullable<RequestInit['body']>;

export type StoredObjectMeta = {
  key: string;
  size: number;
  contentType?: string;
  etag?: string;
};

export type UploadResult = StoredObjectMeta & { url: string | null };

export type UploadOptions = {
  key?: string;
  folder?: string;
  filename?: string;
  contentType?: string;
};

type StoreOpts = { prefix: string; publicUrl?: string };

type PutInput = {
  key: string;
  body: StoreBody | ArrayBuffer | Uint8Array | string | ReadableStream;
  contentType?: string;
};

/** Driver nội bộ — put/head/delete theo config. */
interface StorageBackend {
  readonly enabled: boolean;
  readonly driver: string;
  url(key: string): string | null;
  put(input: PutInput): Promise<StoredObjectMeta>;
  head(key: string): Promise<StoredObjectMeta | null>;
  delete(key: string): Promise<void>;
}

function sanitizePath(value: string, label: string): string {
  const normalized = value.replace(/\\/g, '/').replace(/^\/+/, '');
  const segments = normalized.split('/').filter((s) => s.length > 0);
  if (segments.some((s) => s === '..' || s === '.')) {
    throw new HttpError(`Invalid ${label}.`, 400, 'INVALID_PATH');
  }
  return segments.join('/');
}

function prefixedKey(raw: string, opts: StoreOpts): string {
  const key = sanitizePath(raw, 'key');
  const { prefix } = opts;
  if (!prefix) return key;
  const base = sanitizePath(prefix.replace(/\/+$/, ''), 'prefix');
  if (key === base || key.startsWith(`${base}/`)) return key;
  return `${base}/${key}`;
}

function publicUrl(key: string, opts: StoreOpts): string | null {
  const base = opts.publicUrl?.replace(/\/+$/, '');
  return base ? `${base}/${encodeURI(prefixedKey(key, opts))}` : null;
}

function disabledBackend(opts: StoreOpts): StorageBackend {
  return {
    enabled: false,
    driver: 'none',
    url: (key) => publicUrl(key, opts),
    put: () => Promise.reject(new Error('Storage disabled — set storage in config/server.ts')),
    head: () => Promise.resolve(null),
    delete: () => Promise.resolve(),
  };
}

/** S3-compatible backend — dùng cho `s3` và `r2` (Cloudflare R2). */
function s3CompatibleBackend(
  driverConfig: S3Config,
  opts: StoreOpts,
  driver: 's3' | 'r2',
): StorageBackend {
  const accessKeyId = driverConfig.accessKeyId ?? '';
  const secretAccessKey = driverConfig.secretAccessKey ?? '';
  const endpoint = (driverConfig.endpoint ?? '').replace(/\/+$/, '');
  const bucket = driverConfig.bucket ?? '';
  const region = driverConfig.region ?? 'auto';

  if (!accessKeyId || !secretAccessKey || !endpoint || !bucket) {
    throw new Error(`${driver} driver needs bucket, endpoint, accessKeyId, secretAccessKey.`);
  }

  const client = new AwsClient({ accessKeyId, secretAccessKey, region, service: 's3' });
  const objectUrl = (key: string) =>
    `${endpoint}/${bucket}/${prefixedKey(key, opts).split('/').map(encodeURIComponent).join('/')}`;

  const signed = async (method: string, key: string, init?: RequestInit) => {
    const req = await client.sign(new Request(objectUrl(key), { method, ...init }));
    return fetch(req);
  };

  return {
    enabled: true,
    driver,
    url: (key) => publicUrl(key, opts),
    async put(input) {
      const key = prefixedKey(input.key, opts);
      const headers = new Headers();
      if (input.contentType) headers.set('Content-Type', input.contentType);
      const res = await signed('PUT', input.key, { headers, body: input.body as StoreBody });
      if (!res.ok) throw new Error(`${driver} put ${res.status}: ${await res.text()}`);
      return { key, size: 0, contentType: input.contentType, etag: res.headers.get('etag') ?? undefined };
    },
    async head(key) {
      const k = prefixedKey(key, opts);
      const res = await signed('HEAD', key);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`${driver} head ${res.status}`);
      return {
        key: k,
        size: Number(res.headers.get('content-length') ?? 0),
        contentType: res.headers.get('content-type') ?? undefined,
      };
    },
    async delete(key) {
      const res = await signed('DELETE', key);
      if (!res.ok && res.status !== 404) throw new Error(`${driver} delete ${res.status}`);
    },
  };
}

type BackendFactory = (config: StorageConfig, opts: StoreOpts) => StorageBackend;

const customBackends = new Map<string, BackendFactory>();

/** Custom driver — `storage({ driver: 'custom', config: { name: '...' } })`. */
export function registerObjectStore(name: string, factory: BackendFactory): void {
  customBackends.set(name, factory);
}

/** Đọc `StorageConfig` → chọn backend theo `driver`. */
function resolveBackend(config: StorageConfig): StorageBackend {
  const opts = storeOptions(config);
  if (!isStorageActive(config)) return disabledBackend(opts);

  if (config.driver === 'custom') {
    const name = (config.config as CustomConfig | undefined)?.name;
    if (!name) throw new Error('Custom driver requires config.name.');
    const factory = customBackends.get(name);
    if (!factory) throw new Error(`Unknown custom store "${name}". Call registerObjectStore() first.`);
    return factory(config, opts);
  }

  if (config.driver === 's3' || config.driver === 'r2') {
    return s3CompatibleBackend(config.config ?? {}, opts, config.driver);
  }

  throw new Error(`Unknown driver "${config.driver}".`);
}

function buildKey(folder: string, filename: string): string {
  const safeFolder = sanitizePath(folder, 'folder');
  const safe = (filename.split(/[/\\]/).pop() ?? 'file').replace(/[^a-zA-Z0-9._-]+/g, '-');
  return `${safeFolder}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safe}`;
}

async function parseFiles(request: Request, field = 'file'): Promise<File[]> {
  if (!(request.headers.get('content-type') ?? '').includes('multipart/form-data')) {
    throw new HttpError('Expected multipart/form-data.', 415, 'INVALID_UPLOAD');
  }

  const files = [...(await request.formData()).entries()]
    .filter(([name, value]) => name === field && value instanceof File && value.size > 0)
    .map(([, value]) => value as File);

  if (files.length === 0) {
    throw new HttpError(`Field "${field}" not found.`, 400, 'EMPTY_UPLOAD');
  }

  return files;
}

export abstract class BaseStorageController {
  private readonly backend: StorageBackend;

  constructor(config: StorageConfig) {
    this.backend = resolveBackend(config);
  }

  get enabled(): boolean {
    return this.backend.enabled;
  }

  /** Driver đang dùng: `s3` | `r2` | `custom` | `none`. */
  get driver(): string {
    return this.backend.driver;
  }

  /** Upload blob — key tự sinh nếu không truyền `options.key`. */
  async upload(file: Blob, options: UploadOptions = {}): Promise<UploadResult> {
    const contentType = options.contentType ?? (file.type || 'application/octet-stream');
    const key =
      options.key ??
      buildKey(options.folder ?? 'uploads', options.filename ?? 'file');
    const meta = await this.backend.put({ key, body: file, contentType });
    return { ...meta, url: this.backend.url(meta.key) };
  }

  protected async deleteKey(key: string): Promise<void> {
    await this.backend.delete(key);
  }

  protected headKey(key: string): Promise<StoredObjectMeta | null> {
    return this.backend.head(key);
  }

  protected objectUrl(key: string): string | null {
    return this.backend.url(key);
  }

  protected json<T>(c: Context<RequestContext>, data: T, status: ContentfulStatusCode = 200) {
    return c.json(data, status);
  }

  protected notFound(c: Context<RequestContext>, message = 'Not Found') {
    return c.json({ error: message, code: 'NOT_FOUND' }, 404);
  }

  protected assertEnabled() {
    if (!this.enabled) throw new HttpError('Storage disabled.', 503, 'STORAGE_DISABLED');
  }

  private requireKey(c: Context<RequestContext>): string | Response {
    const key = c.req.query('key');
    if (!key) return c.json({ error: 'Query "key" is required.', code: 'MISSING_KEY' }, 400);
    try {
      return sanitizePath(key, 'key');
    } catch (error) {
      if (error instanceof HttpError) {
        return c.json({ error: error.message, code: error.code }, error.status as ContentfulStatusCode);
      }
      throw error;
    }
  }

  /** POST /api/storage — multipart field `file`. Query `folder` optional. */
  store = async (c: Context<RequestContext>) => {
    this.assertEnabled();
    const folderParam = c.req.query('folder');
    let folder: string | undefined;
    if (folderParam) {
      try {
        folder = sanitizePath(folderParam, 'folder');
      } catch (error) {
        if (error instanceof HttpError) {
          return c.json({ error: error.message, code: error.code }, error.status as ContentfulStatusCode);
        }
        throw error;
      }
    }
    const files = await parseFiles(c.req.raw);
    const data = await Promise.all(
      files.map((file) =>
        this.upload(file, { folder, filename: file.name, contentType: file.type || undefined }),
      ),
    );
    return this.json(c, { data });
  };

  /** DELETE /api/storage/objects?key= */
  destroy = async (c: Context<RequestContext>) => {
    this.assertEnabled();
    const key = this.requireKey(c);
    if (key instanceof Response) return key;
    await this.deleteKey(key);
    return this.json(c, { data: { key, deleted: true } });
  };

  /** GET /api/storage/meta?key= */
  head = async (c: Context<RequestContext>) => {
    this.assertEnabled();
    const key = this.requireKey(c);
    if (key instanceof Response) return key;
    const meta = await this.headKey(key);
    if (!meta) return this.notFound(c, 'Object not found');
    return this.json(c, { data: { ...meta, url: this.objectUrl(meta.key) } });
  };
}
