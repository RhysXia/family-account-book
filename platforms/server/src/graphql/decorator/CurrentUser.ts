import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserEntity } from '../../entity/UserEntity';
import { AuthentizationException } from '../../exception/ServiceException';
import { SESSION_CURRENT_USER } from '../../utils/constants';

const CurrentUser = createParamDecorator(
  (data: { required?: boolean } = {}, ctx: ExecutionContext) => {
    const { session } = GqlExecutionContext.create(ctx).getContext().req;
    const currentUser = session[SESSION_CURRENT_USER] as UserEntity | undefined;
    const required = data.required;

    if (!currentUser) {
      if (required) {
        throw new AuthentizationException('请先登录');
      }

      return null;
    }

    const { createdAt, updatedAt, ...others } = currentUser;

    return {
      ...others,
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
    };
  },
);

export default CurrentUser;
