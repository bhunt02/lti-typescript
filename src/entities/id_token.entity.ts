import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { PlatformInfoType, UserInfoType } from '../utils/types';
import { PlatformModel } from './platform.entity';

@Entity('id_token_model')
export class IdTokenModel extends BaseEntity {
  @PrimaryColumn({ type: 'text' })
  iss: string;

  @PrimaryColumn({ type: 'text' })
  user: string;

  @Column({ type: 'jsonb' })
  userInfo: UserInfoType;

  @Column({ type: 'jsonb' })
  platformInfo: PlatformInfoType;

  @PrimaryColumn({ type: 'text' })
  clientId: string;

  @Column({ type: 'text' })
  platformId: string;

  @PrimaryColumn({ type: 'text' })
  deploymentId: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'integer', default: 3600 * 24 })
  expiresAt: number;

  @ManyToOne(() => PlatformModel, (platform) => platform.idTokens, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([
    { name: 'iss', referencedColumnName: 'platformUrl' },
    { name: 'clientId', referencedColumnName: 'clientId' },
  ])
  platform: PlatformModel;
}
