import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './UserEntity';

/**
 * 项目
 */
@Entity('project')
export class ProjectEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  desc: string;

  @ManyToOne(() => UserEntity, { nullable: false })
  creator: UserEntity;

  @Column({ type: 'timestamptz', nullable: false })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: false })
  updatedAt: Date;
}
