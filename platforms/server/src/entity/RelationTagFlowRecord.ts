import {
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('relation_tag_flow_record')
export class RelationTagFlowRecord {
  @PrimaryColumn()
  tagId!: number;

  @PrimaryColumn()
  flowRecordId!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
