import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { AbstractTimestampEntity } from './abstract/AbstractTimestampEntity';
import { AccountBookEntity } from './AccountBookEntity';

/**
 * 储蓄账户
 */
@Entity('saving_account')
export class SavingAccountEntity extends AbstractTimestampEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: true })
  desc?: string;

  /**
   * 初始金额
   */
  @Column({
    type: 'decimal',
    precision: 11,
    scale: 2,
    nullable: false,
    transformer: new ColumnNumericTransformer(),
  })
  amount!: number;

  @Column({ nullable: false })
  order!: number;

  /**
   * 所属账本
   */
  @ManyToOne(() => AccountBookEntity, { nullable: false })
  accountBook!: AccountBookEntity;
  @Column()
  accountBookId!: number;
}
