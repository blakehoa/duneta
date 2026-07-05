export type PostgresConnection = {
  driver: 'postgres';
  url: string;
  schema?: string;
};

export type DatabaseConnection = PostgresConnection;

export type DatabasePoolConfig = {
  max: number;
  idleTimeout: number;
  connectTimeout: number;
};

export const DEFAULT_DATABASE_POOL: DatabasePoolConfig = {
  max: 10,
  idleTimeout: 20,
  connectTimeout: 10,
};

/** Conservative defaults for Cloudflare Worker isolates (use with Hyperdrive / pooler). */
export const DEFAULT_WORKER_DATABASE_POOL: DatabasePoolConfig = {
  max: 1,
  idleTimeout: 5,
  connectTimeout: 10,
};

export function databasePoolForRuntime(
  _target: 'worker',
  pool: DatabasePoolConfig,
): DatabasePoolConfig {
  const base = { ...DEFAULT_WORKER_DATABASE_POOL, ...pool };
  return { ...base, max: Math.min(base.max, 2) };
}

export type DatabaseConfig<
  TConnections extends object = Record<string, DatabaseConnection>,
> = {
  enabled?: boolean;
  default: string;
  connections: TConnections;
  pool: DatabasePoolConfig;
};

export function postgresConnection(options: { url: string; schema?: string }): PostgresConnection {
  return { driver: 'postgres', url: options.url, schema: options.schema };
}

export function defineConnections<const T extends Record<string, DatabaseConnection | undefined>>(
  connections: T,
) {
  const resolved = {} as {
    [K in keyof T as T[K] extends DatabaseConnection ? K : never]: NonNullable<T[K]>;
  };

  for (const [name, connection] of Object.entries(connections)) {
    if (connection) Object.assign(resolved, { [name]: connection });
  }

  return resolved;
}

export function connectionUrl(config: DatabaseConfig, name: string = config.default) {
  const connection = config.connections[name as keyof typeof config.connections] as
    | DatabaseConnection
    | undefined;
  return connection?.url;
}
