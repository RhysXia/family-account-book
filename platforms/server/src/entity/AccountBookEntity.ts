import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AbstractTimestampEntity } from './abstract/AbstractTimestampEntity';
import { UserEntity } from './UserEntity';

/**
 * 账本
 */
@Entity('account_book')
export class AccountBookEntity extends AbstractTimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  desc?: string;

  @ManyToOne(() => UserEntity, { nullable: false })
  creator: UserEntity;
  @Column()
  creatorId: number;

  @ManyToOne(() => UserEntity, { nullable: false })
  updater: UserEntity;
  @Column()
  updaterId: number;

  // 管理员
  @ManyToMany(() => UserEntity)
  @JoinTable({
    name: 'project_admin',
    joinColumn: { name: 'project_id' },
    inverseJoinColumn: { name: 'admin_id' },
  })
  admins: Array<UserEntity>;

  // 账本普通成员
  @ManyToMany(() => UserEntity)
  @JoinTable({
    name: 'project_member',
    joinColumn: { name: 'project_id' },
    inverseJoinColumn: { name: 'member_id' },
  })
  members: Array<UserEntity>;
}
