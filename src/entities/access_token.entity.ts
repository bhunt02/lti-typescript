import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { EncryptedEntity } from '../utils/types';
import { PlatformModel } from './platform.entity';

@Entity('access_token_model')
export class AccessTokenModel extends EncryptedEntity {
  @PrimaryColumn({ type: 'text' })
  platformUrl: string;

  @PrimaryColumn({ type: 'text' })
  clientId: string;

  @PrimaryColumn({ type: 'text' })
  scopes: string;

  @Column({ type: 'text' })
  iv: string;

  @Column({ type: 'text' })
  data: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'integer', default: 3600 })
  expiresAt: number;

  @ManyToOne(() => PlatformModel, (platform) => platform.accessTokens, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([
    { name: 'platformUrl', referencedColumnName: 'platformUrl' },
    { name: 'clientId', referencedColumnName: 'clientId' },
  ])
  platform: PlatformModel;
}
