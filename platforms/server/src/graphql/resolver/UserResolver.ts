import { Query, Resolver } from '@nestjs/graphql';
import { UserService } from '../../service/UserService';
import CurrentUser from '../decorator/CurrentUser';
import { User } from '../graphql';

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query()
  async users(@CurrentUser() user: User): Promise<Array<User>> {
    return this.userService.findAll();
  }
}
