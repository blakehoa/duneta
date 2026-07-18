import { z } from 'zod';
import type { Context } from 'hono';
import { BaseController } from './base-controller.js';
import type { RequestContext } from '../../middleware/http/request-context.js';

const meResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    emailVerified: z.boolean(),
    image: z.string().nullable().optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }),
});

export class MeController extends BaseController {
  show = async (c: Context<RequestContext>) => {
    const session = await this.resolveSession(c);
    if (!session?.user) return this.unauthorized(c);

    const { id, name, email, emailVerified, image, createdAt, updatedAt } = session.user;
    return this.json(
      c,
      meResponseSchema.parse({
        data: { id, name, email, emailVerified, image, createdAt, updatedAt },
      }),
    );
  };
}
