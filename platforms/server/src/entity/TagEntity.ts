import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CategoryEntity } from './CategoryEntity';
import { ProjectEntity } from './ProjectEntity';
import { UserEntity } from './UserEntity';

/**
 * 标签
 */
@Entity('tag')
export class TagEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  desc: string;

  @ManyToOne(() => UserEntity, { nullable: false })
  creator: UserEntity;

  // 所属项目
  @ManyToOne(() => ProjectEntity, { nullable: false })
  project: ProjectEntity;

  // 所属分类
  @ManyToOne(() => CategoryEntity, { nullable: false })
  category: CategoryEntity;

  @Column({ type: 'timestamptz', nullable: false })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: false })
  updatedAt: Date;
}
