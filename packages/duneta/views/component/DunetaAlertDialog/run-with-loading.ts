import { showDunetaLoading } from './show-loading';
import type { DunetaLoadingOptions } from './types';
export async function runWithDunetaLoading<T>(task: () => Promise<T>, options?: DunetaLoadingOptions): Promise<T> { const loading = showDunetaLoading(options); try { return await task(); } finally { loading.close(); } }
