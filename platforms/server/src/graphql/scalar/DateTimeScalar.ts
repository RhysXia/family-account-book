import { CustomScalar, Scalar } from '@nestjs/graphql';
import { ValueNode, Kind } from 'graphql';

@Scalar('DateTime', () => Date)
export class DateTimeScalar implements CustomScalar<string, Date> {
  description = '日期时间类型';
  parseValue(value: unknown): Date {
    return new Date(value as string); // value from the client
  }

  serialize(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    throw new Error('日期时间序列化失败');
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      return this.parseValue(ast.value);
    }
    throw new Error('日期时间解析失败');
  }
}
