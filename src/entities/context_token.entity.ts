import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import {
  DeepLinkingSettings,
  IMSContext,
  IMSGradeEndpoint,
  IMSLaunchPresentation,
  IMSNamesRoles,
  IMSResourceLink,
  LISClaim,
} from '../utils/types';

@Entity('context_token_model')
export class ContextTokenModel extends BaseEntity {
  @PrimaryColumn({ type: 'text' })
  contextId: string;

  @PrimaryColumn({ type: 'text' })
  user: string;

  @Column({ type: 'text', array: true })
  roles: string[];

  @Column({ type: 'text' })
  path: string;

  @Column({ type: 'text' })
  targetLinkUri: string;

  @Column({ type: 'jsonb' })
  resource: IMSResourceLink;

  @Column({ type: 'jsonb', nullable: true })
  context?: IMSContext;

  @Column({ type: 'jsonb', nullable: true })
  custom?: Record<string, string>;

  @Column({ type: 'jsonb', nullable: true })
  launchPresentation: IMSLaunchPresentation;

  @Column({ type: 'text', nullable: true })
  messageType: string;

  @Column({ type: 'text', nullable: true })
  version: string;

  @Column({ type: 'jsonb', nullable: true })
  deepLinkingSettings?: DeepLinkingSettings;

  @Column({ type: 'jsonb', nullable: true })
  lis?: LISClaim;

  @Column({ type: 'jsonb', nullable: true })
  endpoint?: IMSGradeEndpoint;

  @Column({ type: 'jsonb', nullable: true })
  namesRoles?: IMSNamesRoles;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'integer', default: 3600 * 24 })
  expiresAt: number;
}
