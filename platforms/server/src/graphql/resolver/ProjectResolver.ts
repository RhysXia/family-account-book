import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UserService } from '../../service/UserService';
import Session from '../decorator/Session';
import { ProjectInput, User } from '../graphql';

@Resolver('Project')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation()
  async createProject(
    @Session() session: Record<string, any>,
    @Args('project') projectInput: ProjectInput,
  ): Promise<User> {
    return
  }
}
