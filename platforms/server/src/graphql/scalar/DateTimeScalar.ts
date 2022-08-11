import { CustomScalar, Scalar } from '@nestjs/graphql';
import { ValueNode, Kind } from 'graphql';

@Scalar('DateTime', () => Date)
export class DateTimeScalar implements CustomScalar<string, Date> {
  description = '日期时间类型';
  parseValue(value: unknown): Date {
    return new Date(value as string); // value from the client
  }

  serialize(value: unknown): string {
    return value instanceof Date ? value.toISOString() : null;
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  }
}
