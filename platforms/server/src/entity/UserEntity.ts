import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractTimestampEntity } from './AbstractTimestampEntity';

@Entity('user')
export class UserEntity extends AbstractTimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  username: string;

  @Column({ nullable: false })
  password: string;

  @Column({})
  email: string | null;
}
