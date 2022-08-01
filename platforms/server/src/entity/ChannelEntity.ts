import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractTimestampEntity } from './AbstractTimestampEntity';
import { UserEntity } from './UserEntity';

/**
 * 支付和收入渠道
 */
@Entity('channel')
export class ChannelEntity extends AbstractTimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  desc: string;

  @Column({ nullable: false, type: 'json' })
  extra: Record<string, any>;

  @ManyToOne(() => UserEntity, { nullable: false })
  creator: UserEntity;
}
