/**
 * Database = Cloudflare Hyperdrive only.
 * @see https://developers.cloudflare.com/hyperdrive/reference/supported-databases-and-features/
 */

export type DatabaseConnection = {
  driver: 'postgres';
  /** Wrangler `hyperdrive[].binding` name. */
  hyperdrive: string;
  schema?: string;
};

export type DatabaseConfig<
  TConnections extends object = Record<string, DatabaseConnection>,
> = {
  enabled?: boolean;
  default: string;
  connections: TConnections;
};

export function postgres(
  hyperdrive: string,
  options?: { schema?: string },
): DatabaseConnection {
  return { driver: 'postgres', hyperdrive, ...options };
}

export function defineConnections<
  const T extends Record<string, DatabaseConnection | undefined>,
>(connections: T) {
  const resolved = {} as {
    [K in keyof T as T[K] extends DatabaseConnection ? K : never]: NonNullable<
      T[K]
    >;
  };
  for (const [name, connection] of Object.entries(connections)) {
    if (connection) Object.assign(resolved, { [name]: connection });
  }
  return resolved;
}
