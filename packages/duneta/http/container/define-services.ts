import type { ControllerContainer } from './controller-container.js';
import type { RepositoryContainer } from './repository-container.js';
import type { RegisterServices, ServiceRegistryContext } from './types.js';

/** `(ctx) => instance` */
export type ServiceFactory = (ctx: ServiceRegistryContext) => object;

/** Zero-arg class — `defineServices` gọi `new Class()`. */
export type ServiceClass = new () => object;

export type ServiceBinding = ServiceFactory | ServiceClass;

export type ServicesDefinition = {
  repositories?: Record<string, ServiceBinding>;
  controllers?: Record<string, ServiceBinding>;
};

function isServiceClass(value: ServiceBinding): value is ServiceClass {
  return (
    typeof value === 'function'
    && /^class\s/.test(Function.prototype.toString.call(value))
  );
}

function toFactory(binding: ServiceBinding): ServiceFactory {
  if (isServiceClass(binding)) {
    const Ctor = binding;
    return () => new Ctor();
  }
  return binding;
}

function registerActive(
  container: ControllerContainer | RepositoryContainer,
  bindings: Record<string, ServiceBinding> | undefined,
  ctx: ServiceRegistryContext,
) {
  if (!bindings) return;

  for (const [key, binding] of Object.entries(bindings)) {
    const factory = toFactory(binding);
    container.singleton(key, () => factory(ctx));
  }
}

/** Khai báo DI — repositories trước, controllers sau. */
export function defineServices(definition: ServicesDefinition): RegisterServices {
  return (ctx) => {
    registerActive(ctx.repositories, definition.repositories, ctx);
    registerActive(ctx.controllers, definition.controllers, ctx);
  };
}
