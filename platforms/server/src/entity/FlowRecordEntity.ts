import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractTimestampEntity } from './abstract/AbstractTimestampEntity';
import { AccountBookEntity } from './AccountBookEntity';
import { UserEntity } from './UserEntity';
import { SavingAccountEntity } from './SavingAccountEntity';
import { TagEntity } from './TagEntity';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';

/**
 * 流水记录
 */
@Entity('flow_record')
export class FlowRecordEntity extends AbstractTimestampEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  desc?: string;

  /**
   * 数额，
   * 正数为收入，负数为支出
   */
  @Column({
    type: 'decimal',
    precision: 11,
    scale: 2,
    nullable: false,
    transformer: new ColumnNumericTransformer(),
  })
  amount!: number;

  /**
   * 所属账本
   */
  @ManyToOne(() => AccountBookEntity, { nullable: false })
  accountBook!: AccountBookEntity;
  @Column()
  accountBookId!: number;

  /**
   * 交易者
   */
  @ManyToOne(() => UserEntity, { nullable: false })
  trader!: UserEntity;
  @Column()
  traderId!: number;

  @ManyToOne(() => TagEntity, { nullable: false })
  tag!: TagEntity;
  @Column()
  tagId!: number;

  /**
   * 支付或者收入渠道
   */
  @ManyToOne(() => SavingAccountEntity, { nullable: false })
  savingAccount!: SavingAccountEntity;
  @Column()
  savingAccountId!: number;

  /**
   * 交易时间
   */
  @Column({ type: 'timestamptz', nullable: false })
  dealAt!: Date;
}
