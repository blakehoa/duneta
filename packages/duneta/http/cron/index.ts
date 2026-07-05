import type { Auth } from '../../auth/types.js';
import type { Cache } from '../cache/index.js';
import type { DunetaServerConfig } from '../../config/server/types.js';
import type { ControllerContainer } from '../container/controller-container.js';
import type { RepositoryContainer } from '../container/repository-container.js';
import type { Database } from '../database/types.js';

export type CronSchedule = string | readonly string[];

export type CronJobContext = {
  cron: string;
  scheduledTime: number;
  config: DunetaServerConfig;
  db: Database | null;
  auth: Auth | null;
  cache: Cache;
  controllers: ControllerContainer;
  repositories: RepositoryContainer;
  waitUntil: (promise: Promise<unknown>) => void;
};

export abstract class BaseKernelCron {
  abstract readonly name: string;
  abstract readonly schedule: CronSchedule;
  readonly enabled: boolean = true;

  abstract handle(ctx: CronJobContext): void | Promise<void>;

  schedules(): readonly string[] {
    return typeof this.schedule === 'string' ? [this.schedule] : this.schedule;
  }

  matches(cron: string): boolean {
    return this.enabled !== false && this.schedules().includes(cron);
  }
}

export class CronKernel {
  private readonly jobs = new Map<string, BaseKernelCron>();

  register(job: BaseKernelCron): this {
    if (this.jobs.has(job.name)) {
      throw new Error(`Cron job "${job.name}" is already registered.`);
    }
    this.jobs.set(job.name, job);
    return this;
  }

  all(): BaseKernelCron[] {
    return [...this.jobs.values()];
  }

  due(cron: string): BaseKernelCron[] {
    return this.all().filter((job) => job.matches(cron));
  }
}

export type KernelCronClass = new () => BaseKernelCron;
export type KernelCronEntry = BaseKernelCron | KernelCronClass;
export type RegisterCronJobs = (kernel: CronKernel) => void | Promise<void>;
export type CronKernelDefinition = RegisterCronJobs | readonly KernelCronEntry[];

function resolveEntry(entry: KernelCronEntry): BaseKernelCron {
  return typeof entry === 'function' ? new entry() : entry;
}

export function defineCronKernel(definition: CronKernelDefinition): RegisterCronJobs {
  if (typeof definition === 'function') {
    return definition;
  }

  return (kernel) => {
    for (const entry of definition) {
      kernel.register(resolveEntry(entry));
    }
  };
}

export async function createCronKernel(register?: RegisterCronJobs): Promise<CronKernel> {
  const kernel = new CronKernel();
  await register?.(kernel);
  return kernel;
}

export async function runDueCronJobs(
  jobs: readonly BaseKernelCron[],
  ctx: CronJobContext,
): Promise<BaseKernelCron[]> {
  const due = jobs.filter((job) => job.matches(ctx.cron));

  for (const job of due) {
    await job.handle(ctx);
  }

  return due;
}
