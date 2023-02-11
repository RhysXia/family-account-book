import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AbstractTimestampEntity } from './abstract/AbstractTimestampEntity';
import { AccountBookEntity } from './AccountBookEntity';
import { FlowRecordEntity } from './FlowRecordEntity';

/**
 * 标签
 */
@Entity('tag')
export class TagEntity extends AbstractTimestampEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: true })
  desc?: string;

  /**
   * 所属账本
   */
  @ManyToOne(() => AccountBookEntity, { nullable: false })
  accountBook!: AccountBookEntity;
  @Column()
  accountBookId!: number;

  @ManyToMany(() => FlowRecordEntity)
  @JoinTable({
    name: 'relation_tag_flowrecord',
    joinColumn: {
      name: 'tag_id',
    },
    inverseJoinColumn: {
      name: 'flow_record_id',
    },
  })
  flowRecords!: Array<FlowRecordEntity>;
}
