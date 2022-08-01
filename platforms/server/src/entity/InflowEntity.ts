import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 收入
 */
@Entity('inflow')
export class RecordEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // 数额
  @Column({ type: 'decimal', precision: 11, scale: 2 })
  amount: number;
}
