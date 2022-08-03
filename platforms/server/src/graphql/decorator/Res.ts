import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

const Res = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const res = GqlExecutionContext.create(ctx).getContext().res;

    if (data) {
      return res[data];
    }

    return res;
  },
);

export default Res;
