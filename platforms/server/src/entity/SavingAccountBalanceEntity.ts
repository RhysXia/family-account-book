import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
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
   * 排序，说明账户余额变化的先后顺序
   */
  @Index()
  @Column({ nullable: false })
  order: number;

  /**
   * 余额
   */
  @Column({ type: 'decimal', precision: 11, scale: 2, nullable: false })
  amount: number;

  /**
   * 变化日期，通常和order大小一致
   */
  @Column({ type: 'timestamptz', nullable: false })
  changedAt: Date;

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
