import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { AbstractTimestampEntity } from './abstract/AbstractTimestampEntity';
import { AccountBookEntity } from './AccountBookEntity';
import { SavingAccountEntity } from './SavingAccountEntity';

/**
 * 储蓄账户余额记录
 */
@Entity('saving_account_history')
export class SavingAccountHistoryEntity extends AbstractTimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 余额
   */
  @Column({
    type: 'decimal',
    precision: 11,
    scale: 2,
    nullable: false,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  /**
   * 交易日期
   */
  @Column({ type: 'timestamptz', nullable: false })
  dealAt: Date;

  /**
   * 所属账户
   */
  @ManyToOne(() => SavingAccountEntity, { nullable: false })
  savingAccount: SavingAccountEntity;
  @Column()
  savingAccountId: number;

  /**
   * 所属账本
   */
  @ManyToOne(() => AccountBookEntity, { nullable: false })
  accountBook: AccountBookEntity;
  @Column()
  accountBookId: number;
}
