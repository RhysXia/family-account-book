import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AbstractTimestampEntity } from './abstract/AbstractTimestampEntity';
import { AccountBookEntity } from './AccountBookEntity';
import { CategoryEntity } from './CategoryEntity';
import { UserEntity } from './UserEntity';

/**
 * 标签
 */
@Entity('tag')
export class TagEntity extends AbstractTimestampEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: true })
  desc?: string;

  @ManyToOne(() => CategoryEntity, { nullable: false })
  category!: CategoryEntity;
  @Column()
  categoryId!: number;

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
