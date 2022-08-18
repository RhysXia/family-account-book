import { ResolveField, Resolver } from '@nestjs/graphql';

@Resolver('Node')
export class NodeResolver {
  constructor() {}

  @ResolveField()
  async node(@Parent() parent: any) {
    return parent;
  }
}
