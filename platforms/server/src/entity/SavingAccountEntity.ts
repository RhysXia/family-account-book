import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { AbstractTimestampEntity } from './abstract/AbstractTimestampEntity';
import { AccountBookEntity } from './AccountBookEntity';
import { UserEntity } from './UserEntity';

/**
 * 储蓄账户
 */
@Entity('saving_account')
export class SavingAccountEntity extends AbstractTimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

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
  initialAmount: number;

  /**
   * 创建人
   */
  @ManyToOne(() => UserEntity, { nullable: false })
  creator: UserEntity;
  @Column()
  creatorId: number;

  /**
   * 修改人
   */
  @ManyToOne(() => UserEntity, { nullable: false })
  updater: UserEntity;
  @Column()
  updaterId: number;

  /**
   * 所属账本
   */
  @ManyToOne(() => AccountBookEntity, { nullable: false })
  accountBook: AccountBookEntity;
  @Column()
  accountBookId: number;

  /**
   * 删除时间
   */
  @DeleteDateColumn()
  deletedAt?: Date;
}
