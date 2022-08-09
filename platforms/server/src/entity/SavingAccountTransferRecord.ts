import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractTimestampEntity } from './abstract/AbstractTimestampEntity';
import { SavingAccountEntity } from './SavingAccountEntity';
import { UserEntity } from './UserEntity';

/**
 * 卡卡转账记录
 */
@Entity('saving_account_transfer_record')
export class SavingAccountTransferRecordEntity extends AbstractTimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  desc?: string;

  /**
   * 数额，
   * 正数
   */
  @Column({ type: 'decimal', precision: 11, scale: 2, nullable: false })
  amount: number;

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
   * 从哪张卡转出
   */
  @ManyToOne(() => SavingAccountEntity, { nullable: false })
  from: SavingAccountEntity;

  /**
   * 转入哪张卡
   */
  @ManyToOne(() => SavingAccountEntity, { nullable: false })
  to: SavingAccountEntity;

  /**
   * 交易时间
   */
  @Column({ type: 'timestamptz', nullable: false })
  dealAt: Date;
}
