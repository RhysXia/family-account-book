import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
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
   * 所属账本
   */
  @ManyToOne(() => AccountBookEntity, { nullable: false })
  accountBook: AccountBookEntity;

  /**
   * 删除时间
   */
  @DeleteDateColumn()
  deletedAt?: Date;
}
