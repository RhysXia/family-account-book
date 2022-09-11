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
    if (value instanceof Date) {
      return value.toISOString();
    }
    throw new Error('日期序列化失败');
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      return this.parseValue(ast.value);
    }
    throw new Error('日期解析失败');
  }
}
