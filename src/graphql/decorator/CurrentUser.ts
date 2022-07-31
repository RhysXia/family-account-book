import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { SESSION_CURRENT_USER } from '../../utils/constants';

const CurrentUser = createParamDecorator(
  (data: boolean | undefined, ctx: ExecutionContext) => {
    const { session } = GqlExecutionContext.create(ctx).getContext().req;
    const currentUser = session[SESSION_CURRENT_USER];
    if (data && !currentUser) {
      throw new HttpException('请先登录', HttpStatus.UNAUTHORIZED);
    }

    return currentUser;
  },
);

export default CurrentUser;
