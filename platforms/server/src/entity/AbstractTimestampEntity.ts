import { Column } from 'typeorm';

export class AbstractTimestampEntity {
  @Column({ type: 'timestamptz', nullable: false })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: false })
  updatedAt: Date;
}
