import type { Context } from 'hono';
import { UserPolicy } from '../../permission/policies/user-policy.js';
import { BaseController } from './base-controller.js';
import type { RequestContext } from '../../middleware/http/request-context.js';
import type { UserRepository } from '../repositories/user-repository.js';

export class UserController extends BaseController {
  constructor(private readonly users: UserRepository) {
    super();
  }

  index = async (c: Context<RequestContext>) => {
    UserPolicy.list(c);
    return this.json(c, { data: await this.users.findAll() });
  };

  show = async (c: Context<RequestContext>) => {
    const id = c.req.param('id');
    if (!id) return this.notFound(c);

    const user = await this.users.findById(id);
    if (!user) return this.notFound(c, 'User not found');

    UserPolicy.view(c, { id: user.id as string });
    return this.json(c, { data: user });
  };
}
