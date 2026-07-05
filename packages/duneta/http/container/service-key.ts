export type ServiceKey<T = unknown> = string | (abstract new (...args: never[]) => T);

export function serviceKey<T>(key: ServiceKey<T>): string {
  return typeof key === 'string' ? key : key.name;
}
