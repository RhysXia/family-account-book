import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

const Req = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const req = GqlExecutionContext.create(ctx).getContext().req;

    if (data) {
      return req[data];
    }

    return req;
  },
);

export default Req;
