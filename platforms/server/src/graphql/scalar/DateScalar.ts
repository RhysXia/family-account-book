import { CustomScalar, Scalar } from '@nestjs/graphql';
import { ValueNode, Kind } from 'graphql';
import dayjs from 'dayjs';

@Scalar('Date', () => Date)
export class DateScalar implements CustomScalar<string, Date> {
  description = '日期类型';
  parseValue(value: unknown): Date {
    return new Date(dayjs(value as string).format('YYYY-MM-DD'));
  }

  serialize(value: unknown): string {
    return value instanceof Date ? value.toISOString() : null;
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      return this.parseValue(ast.value);
    }
    return null;
  }
}
