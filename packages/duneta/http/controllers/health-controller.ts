import { z } from 'zod';
import type { Context } from 'hono';
import { BaseController } from './base-controller.js';
import type { RequestContext } from '../../middleware/http/request-context.js';

const healthResponseSchema = z.object({
  ok: z.literal(true),
  message: z.string(),
  locale: z.string(),
  timezone: z.string(),
  requestId: z.string(),
});

export class HealthController extends BaseController {
  show = (c: Context<RequestContext>) =>
    this.json(
      c,
      healthResponseSchema.parse({
        ok: true,
        message: 'Service is healthy',
        locale: this.locale(c),
        timezone: this.timezone(c),
        requestId: this.requestId(c),
      }),
    );
}
