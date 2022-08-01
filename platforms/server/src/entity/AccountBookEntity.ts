import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AbstractTimestampEntity } from './AbstractTimestampEntity';
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

  @Column({ nullable: false })
  desc: string;

  @ManyToOne(() => UserEntity, { nullable: false })
  creator: UserEntity;

  // 账本成员
  @ManyToMany(() => UserEntity)
  @JoinTable({
    name: 'project_user',
    joinColumn: { name: 'project_id' },
    inverseJoinColumn: { name: 'member_id' },
  })
  members: Array<UserEntity>;
}
