export type WorkerEnv = Record<string, unknown> | null | undefined;

let env: WorkerEnv;

export function setWorkerEnv(next: WorkerEnv) {
  env = next;
}

export function clearWorkerEnv() {
  env = undefined;
}

export function hyperdriveUrl(binding: string): string {
  const value = env?.[binding] as { connectionString?: string } | undefined;
  const url = value?.connectionString;
  if (!url) {
    throw new Error(
      `[duneta] missing Hyperdrive binding "${binding}" (wrangler hyperdrive[].binding)`,
    );
  }
  return url;
}
