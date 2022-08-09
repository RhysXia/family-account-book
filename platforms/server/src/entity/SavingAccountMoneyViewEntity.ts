import { ViewColumn, ViewEntity } from 'typeorm';
import { SavingAccountMoneyRecordEntity } from './SavingAccountMoneyRecordEntity';

/**
 * 最新余额记录
 */
@ViewEntity({
  expression: (dataSource) => {
    return dataSource
      .createQueryBuilder()
      .select('b2.*')
      .from((cb) => {
        return cb
          .select(
            'row_number() over (partition by b1.savingAccountId order by b1.dealAt desc) rowNumber,  b1.*',
          )
          .from(SavingAccountMoneyRecordEntity, 'b1');
      }, 'b2')
      .where('b2.rowNumber = 1');
  },
})
export class SavingAccountMoneyViewEntity {
  @ViewColumn()
  id: number;

  /**
   * 余额
   */
  @ViewColumn()
  amount: number;

  /**
   * 交易日期
   */
  @ViewColumn()
  dealAt: Date;

  @ViewColumn()
  savingAccountId: number;

  @ViewColumn()
  createdAt: Date;

  @ViewColumn()
  updatedAt: Date;
}
