import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProjectEntity } from './ProjectEntity';
import { UserEntity } from './UserEntity';

/**
 * 分类
 */
@Entity('category')
export class CategoryEntity {
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

  @Column({ type: 'timestamptz', nullable: false })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: false })
  updatedAt: Date;
}
