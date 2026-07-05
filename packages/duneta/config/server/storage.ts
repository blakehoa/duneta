export type StorageDriver = 's3' | 'r2' | 'custom';

/** S3-compatible — AWS S3, MinIO, Cloudflare R2, … */
export type S3Config = {
  prefix?: string;
  publicUrl?: string;
  bucket?: string;
  endpoint?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
};

export type CustomConfig = {
  /** Id passed to `registerObjectStore()`. */
  name: string;
  prefix?: string;
  publicUrl?: string;
  options?: Record<string, unknown>;
};

export type StorageDriverConfigMap = {
  s3: S3Config;
  r2: S3Config;
  custom: CustomConfig;
};

export type StorageDisabled = {
  enabled?: false;
};

export type ActiveStorageConfig<D extends StorageDriver = StorageDriver> = {
  enabled: true;
  driver: D;
  config?: D extends 'custom'
    ? CustomConfig
    : Partial<StorageDriverConfigMap[D]>;
};

export type StorageConfig = StorageDisabled | ActiveStorageConfig;

export function isStorageActive(config: StorageConfig): config is ActiveStorageConfig {
  return config.enabled === true;
}

export function storage<D extends Exclude<StorageDriver, 'custom'>>(
  input: {
    driver: D;
    config?: Partial<StorageDriverConfigMap[D]>;
  },
): ActiveStorageConfig<D>;

export function storage(
  input: {
    driver: 'custom';
    config: CustomConfig;
  },
): ActiveStorageConfig<'custom'>;

export function storage(
  input: {
    driver: StorageDriver;
    config?: Partial<S3Config | CustomConfig>;
  },
): ActiveStorageConfig {
  return {
    enabled: true,
    ...input,
    config: {
      prefix: 'uploads/',
      ...input.config,
    },
  } as ActiveStorageConfig;
}

export function storeOptions(config: StorageConfig): {
  prefix: string;
  publicUrl?: string;
} {
  if (!isStorageActive(config)) {
    return { prefix: 'uploads/' };
  }

  return {
    prefix: config.config?.prefix ?? 'uploads/',
    publicUrl: config.config?.publicUrl,
  };
}
