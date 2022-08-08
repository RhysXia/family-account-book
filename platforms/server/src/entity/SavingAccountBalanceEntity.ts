import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractTimestampEntity } from './abstract/AbstractTimestampEntity';
import { SavingAccountEntity } from './SavingAccountEntity';
import { UserEntity } from './UserEntity';

/**
 * 储蓄账户余额
 */
@Entity('saving_account_balance')
export class SavingAccountBalanceEntity extends AbstractTimestampEntity {
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
  @Column({ type: 'timestamptz', nullable: false })
  dealAt: Date;

  /**
   * 创建人
   */
  @ManyToOne(() => UserEntity, { nullable: false })
  creator: UserEntity;

  /**
   * 修改人
   */
  @ManyToOne(() => UserEntity, { nullable: false })
  updater: UserEntity;

  /**
   * 所属账户
   */
  @ManyToOne(() => SavingAccountEntity, { nullable: false })
  savingAccount: SavingAccountEntity;
}
