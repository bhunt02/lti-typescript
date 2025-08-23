import {BaseEntity, Column, CreateDateColumn, Entity, PrimaryColumn,} from 'typeorm';

@Entity('state_model')
export class StateModel extends BaseEntity {
  @PrimaryColumn({ type: 'text' })
  state: string;

  @Column({ type: 'jsonb' })
  query: any;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'integer', default: 10 })
  expiresAt: number;
}
