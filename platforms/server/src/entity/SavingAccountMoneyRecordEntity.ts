import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractTimestampEntity } from './abstract/AbstractTimestampEntity';
import { SavingAccountEntity } from './SavingAccountEntity';

/**
 * 储蓄账户余额记录
 */
@Entity('saving_account_money_record')
export class SavingAccountMoneyRecordEntity extends AbstractTimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 余额
   */
  @Column({ type: 'decimal', precision: 11, scale: 2, nullable: false })
  amount: number;

  /**
   * 交易日期
   */
  @Column({ type: 'date', nullable: false })
  dealAt: Date;

  /**
   * 所属账户
   */
  @ManyToOne(() => SavingAccountEntity, { nullable: false })
  savingAccount: SavingAccountEntity;
  @Column()
  savingAccountId: number;
}
