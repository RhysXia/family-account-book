import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
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
  id!: number;

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: true })
  desc?: string;

  // 管理员
  @ManyToMany(() => UserEntity)
  @JoinTable({
    name: 'relation_accountbook_admin',
    joinColumn: { name: 'accountbook_id' },
    inverseJoinColumn: { name: 'admin_id' },
  })
  admins!: Array<UserEntity>;

  // 账本普通成员
  @ManyToMany(() => UserEntity)
  @JoinTable({
    name: 'relation_accountbook_member',
    joinColumn: { name: 'accountbook_id' },
    inverseJoinColumn: { name: 'member_id' },
  })
  members!: Array<UserEntity>;
}
