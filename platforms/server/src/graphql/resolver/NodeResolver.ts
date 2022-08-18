import { Args, ResolveField, Resolver } from '@nestjs/graphql';
import { UserEntity } from '../../entity/UserEntity';
import CurrentUser from '../decorator/CurrentUser';

@Resolver('Node')
export class NodeResolver {
  constructor() {}

  @ResolveField()
  async node(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('id') id: string,
  ) {
    return parent;
  }
}
