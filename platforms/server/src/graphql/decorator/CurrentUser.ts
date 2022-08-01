import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { SESSION_CURRENT_USER } from '../../utils/constants';

const CurrentUser = createParamDecorator(
  (data: { required?: boolean } = {}, ctx: ExecutionContext) => {
    const { session } = GqlExecutionContext.create(ctx).getContext().req;
    const currentUser = session[SESSION_CURRENT_USER];
    const required = data.required;

    if (required && !currentUser) {
      throw new Error('请先登录');
    }

    return currentUser;
  },
);

export default CurrentUser;
