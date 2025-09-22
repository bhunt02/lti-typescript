import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('nonce_model')
export class NonceModel extends BaseEntity {
  @PrimaryColumn({ type: 'text' })
  nonce: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'integer', default: 10 })
  expiresAt: number;
}
