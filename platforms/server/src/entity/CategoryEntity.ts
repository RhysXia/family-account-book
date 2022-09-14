import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractTimestampEntity } from './abstract/AbstractTimestampEntity';
import { AccountBookEntity } from './AccountBookEntity';
import { UserEntity } from './UserEntity';

/**
 * 分类类型
 */
export enum CategoryType {
  /**
   * 该分类下的金额只能为正数
   */
  POSITIVE_AMOUNT = 'POSITIVE_AMOUNT',
  /**
   * 该分类下的金额只能为负数
   */
  NEGATIVE_AMOUNT = 'NEGATIVE_AMOUNT',

  /**
   * 该分类下的金额可正可负
   */
  POSITIVE_OR_NEGATIVE_AMOUNT = 'POSITIVE_OR_NEGATIVE_AMOUNT',
}

/**
 * 流水分类
 */
@Entity('category')
export class CategoryEntity extends AbstractTimestampEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: true })
  desc?: string;

  @Column({ nullable: false, type: 'enum', enum: CategoryType })
  type!: CategoryType;

  @ManyToOne(() => UserEntity, { nullable: false })
  creator!: UserEntity;
  @Column()
  creatorId!: number;

  @ManyToOne(() => UserEntity, { nullable: false })
  updater!: UserEntity;
  @Column()
  updaterId!: number;

  /**
   * 所属账本
   */
  @ManyToOne(() => AccountBookEntity, { nullable: false })
  accountBook!: AccountBookEntity;
  @Column()
  accountBookId!: number;
}
