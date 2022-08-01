import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractTimestampEntity } from './abstract/AbstractTimestampEntity';
import { AccountBookEntity } from './AccountBookEntity';
import { UserEntity } from './UserEntity';
import { SavingsEntity } from './SavingsEntity';
import { TagEntity } from './TagEntity';

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

  @Column({ nullable: false })
  desc: number;

  /**
   * 所属账本
   */
  @ManyToOne(() => AccountBookEntity, { nullable: false })
  accountBook: AccountBookEntity;

  @ManyToOne(() => UserEntity, { nullable: false })
  creator: UserEntity;

  @ManyToOne(() => TagEntity, { nullable: false })
  tag: TagEntity;

  /**
   * 支付或者收入渠道，可以不填
   */
  @ManyToOne(() => SavingsEntity, { nullable: true })
  savings: SavingsEntity;
}
