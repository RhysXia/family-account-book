import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class AbstractTimestampEntity {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
