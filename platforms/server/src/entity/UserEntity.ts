import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractTimestampEntity } from './abstract/AbstractTimestampEntity';

@Entity('user')
export class UserEntity extends AbstractTimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ unique: true, nullable: false })
  username: string;

  @Column({ nullable: false })
  password: string;

  @Column({ unique: true, nullable: true })
  email?: string;
}
