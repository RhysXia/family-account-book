import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractTimestampEntity } from './abstract/AbstractTimestampEntity';
import { AccountBookEntity } from './AccountBookEntity';

/**
 * 分类类型
 */
export enum CategoryType {
  /**
   * 收入
   */
  INCOME = 'INCOME',
  /**
   * 支出
   */
  EXPENDITURE = 'EXPENDITURE',

  /**
   * 不确定
   */
  UNKNOWN = 'UNKNOWN',
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

  /**
   * 所属账本
   */
  @ManyToOne(() => AccountBookEntity, { nullable: false })
  accountBook!: AccountBookEntity;
  @Column()
  accountBookId!: number;
}
