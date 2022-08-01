import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

const Session = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const { session } = GqlExecutionContext.create(ctx).getContext().req;

    if (data) {
      return session[data];
    }

    return session;
  },
);

export default Session;
