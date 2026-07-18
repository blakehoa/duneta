import type { Context, Handler } from 'hono';
import type { RequestContext } from '../../middleware/http/request-context.js';
import type { BaseController } from './base-controller.js';

type ControllerHandler = (
  c: Context<RequestContext>,
) => Response | Promise<Response>;

/** Resolve one controller method from the request-scoped DI container. */
export function resolveController(
  key: string,
  method: string,
): Handler<RequestContext> {
  return (c) => {
    const controller = c.get('controllers').resolve<BaseController>(key);
    const handler = (controller as unknown as Record<string, ControllerHandler>)[
      method
    ];
    if (typeof handler !== 'function') {
      throw new Error(`Controller "${key}" has no handler "${method}".`);
    }
    return handler.call(controller, c);
  };
}
