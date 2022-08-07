import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractTimestampEntity } from './abstract/AbstractTimestampEntity';
import { AccountBookEntity } from './AccountBookEntity';
import { UserEntity } from './UserEntity';

/**
 * 标签类型
 */
export enum TagType {
  /**
   * 收入
   */
  INCOME = 'INCOME',
  /**
   * 支出
   */
  EXPENDITURE = 'EXPENDITURE',
  /**
   * 投资
   */
  INVESTMENT = 'INVESTMENT',
  /**
   * 借贷
   */
  LOAD = 'LOAD',
}

/**
 * 标签
 */
@Entity('tag')
export class TagEntity extends AbstractTimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, type: 'enum', enum: TagType })
  type: TagType;

  @ManyToOne(() => UserEntity, { nullable: false })
  creator: UserEntity;

  /**
   * 所属账本
   */
  @ManyToOne(() => AccountBookEntity, { nullable: false })
  accountBook: AccountBookEntity;
}
