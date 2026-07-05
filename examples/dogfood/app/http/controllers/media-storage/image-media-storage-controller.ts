import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { StorageConfig } from 'duneta/config/server';
import {
  BaseStorageController,
  type UploadOptions,
  type UploadResult,
} from 'duneta/http';
import { HttpError } from 'duneta/permission';
import type { RequestContext } from 'duneta/middleware/http';

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MEDIA_PREFIX = 'media/';

async function parseImageFiles(request: Request, field = 'file'): Promise<File[]> {
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

/** Image-only storage — MIME + size validation, keys under `media/`. */
export class ImageMediaStorageController extends BaseStorageController {
  constructor(config: StorageConfig) {
    super(config);
  }

  uploadImage(file: Blob, options: UploadOptions = {}): Promise<UploadResult> {
    const contentType = options.contentType ?? file.type;
    if (!contentType || !IMAGE_TYPES.has(contentType)) {
      throw new HttpError(`Unsupported image "${contentType}".`, 415, 'UNSUPPORTED_IMAGE_TYPE');
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new HttpError(`Image too large (max ${MAX_IMAGE_BYTES}).`, 413, 'IMAGE_TOO_LARGE');
    }

    return this.upload(file, {
      ...options,
      folder: options.folder ?? 'media/images',
      contentType,
    });
  }

  store = async (c: Context<RequestContext>) => {
    this.assertEnabled();
    const folder = c.req.query('folder') ?? undefined;
    const files = await parseImageFiles(c.req.raw);
    const data = await Promise.all(
      files.map((file) =>
        this.uploadImage(file, {
          folder,
          filename: file.name,
          contentType: file.type || undefined,
        }),
      ),
    );
    return this.json(c, { data });
  };

  destroy = async (c: Context<RequestContext>) =>
    this.withMediaKey(c, async (key) => {
      await this.deleteKey(key);
      return this.json(c, { data: { key, deleted: true } });
    });

  head = async (c: Context<RequestContext>) =>
    this.withMediaKey(c, async (key) => {
      const meta = await this.headKey(key);
      if (!meta) return this.notFound(c, 'Object not found');
      return this.json(c, { data: { ...meta, url: this.objectUrl(meta.key) } });
    });

  private async withMediaKey(
    c: Context<RequestContext>,
    handler: (key: string) => Promise<Response>,
  ): Promise<Response> {
    this.assertEnabled();
    const key = c.req.query('key');
    if (!key) {
      return c.json({ error: 'Query "key" is required.', code: 'MISSING_KEY' }, 400);
    }
    if (!key.startsWith(MEDIA_PREFIX)) {
      return c.json({ error: 'Forbidden.', code: 'FORBIDDEN' }, 403);
    }
    try {
      return await handler(key);
    } catch (error) {
      if (error instanceof HttpError) {
        return c.json(
          { error: error.message, code: error.code },
          error.status as ContentfulStatusCode,
        );
      }
      throw error;
    }
  }
}
