import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class AbstractTimestampEntity {
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
