import { ViewColumn, ViewEntity } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { SavingAccountHistoryEntity } from './SavingAccountHistoryEntity';

/**
 * 最新余额记录
 */
@ViewEntity({
  name: 'saving_account_amount_view',
  expression: (dataSource) => {
    return dataSource
      .createQueryBuilder()
      .select('b2.id', 'id')
      .addSelect('b2."savingAccountId"', 'savingAccountId')
      .addSelect('b2."accountBookId"', 'accountBookId')
      .addSelect('b2.amount', 'amount')
      .addSelect('b2."createdAt"', 'createdAt')
      .addSelect('b2."updatedAt"', 'updatedAt')
      .addSelect('b2."dealAt"', 'dealAt')
      .from((qb) => {
        return qb
          .select(
            'row_number() over (partition by b1.savingAccountId order by b1.dealAt desc) rowNumber,  b1.*',
          )
          .from(SavingAccountHistoryEntity, 'b1');
      }, 'b2')
      .where('b2.rowNumber = 1');
  },
})
export class SavingAccountAmountView {
  @ViewColumn()
  id: number;

  /**
   * 余额
   */
  @ViewColumn({
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  /**
   * 交易日期
   */
  @ViewColumn()
  dealAt: Date;

  @ViewColumn()
  savingAccountId: number;

  @ViewColumn()
  accountBookId: number;

  @ViewColumn()
  createdAt: Date;

  @ViewColumn()
  updatedAt: Date;
}
