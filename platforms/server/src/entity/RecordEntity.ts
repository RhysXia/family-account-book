import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractTimestampEntity } from './AbstractTimestampEntity';
import { AccountBookEntity } from './AccountBookEntity';
import { ChannelEntity } from './ChannelEntity';
import { UserEntity } from './UserEntity';

/**
 * 支出和收入记录
 */
@Entity('record')
export class RecordEntity extends AbstractTimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 数额，
   * 整数为收入，负数为支出
   */
  @Column({ type: 'decimal', precision: 11, scale: 2, nullable: false })
  amount: number;

  /**
   * 所属账本
   */
  @ManyToOne(() => AccountBookEntity, { nullable: false })
  accountBook: AccountBookEntity;

  @ManyToOne(() => UserEntity, { nullable: false })
  creator: UserEntity;

  /**
   * 支付渠道，可以不填
   */
  @ManyToOne(() => ChannelEntity, { nullable: true })
  channel: ChannelEntity;
}
