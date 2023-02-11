import { Column, CreateDateColumn, ManyToOne, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '../UserEntity';

export class AbstractTimestampEntity {
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => UserEntity, { nullable: false })
  createdBy!: UserEntity;
  @Column()
  createdById!: number;

  @ManyToOne(() => UserEntity, { nullable: false })
  updatedBy!: UserEntity;
  @Column()
  updatedById!: number;
}
