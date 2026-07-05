import { serviceKey, type ServiceKey } from './service-key.js';

type Factory<T> = () => T;

export class Container {
  private readonly factories = new Map<string, Factory<unknown>>();
  private readonly instances = new Map<string, unknown>();

  singleton<T>(key: string, factory: Factory<T>): this {
    this.factories.set(key, factory as Factory<unknown>);
    return this;
  }

  has(key: string | ServiceKey): boolean {
    return this.factories.has(serviceKey(key));
  }

  resolve<T>(key: ServiceKey<T>): T {
    const name = serviceKey(key);
    const factory = this.factories.get(name);
    if (!factory) throw new Error(`No binding registered for "${name}".`);

    if (!this.instances.has(name)) {
      this.instances.set(name, factory());
    }
    return this.instances.get(name) as T;
  }
}

export function createContainer(): Container {
  return new Container();
}
