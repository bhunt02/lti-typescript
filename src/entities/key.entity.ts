import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { EncryptedEntity } from '../utils/types';
import { PlatformModel } from './platform.entity';

@Entity('key_model')
export class KeyModel extends EncryptedEntity {
  @PrimaryColumn({ type: 'text' })
  kid: string;

  @Column({ type: 'text' })
  platformUrl: string;

  @Column({ type: 'text' })
  clientId: string;

  @Column({ type: 'text' })
  iv: string;

  @Column({ type: 'text' })
  data: string;
}

@Entity('public_key_model')
export class PublicKeyModel extends KeyModel {
  @OneToOne(() => PlatformModel, (platform) => platform.publicKey, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'kid', referencedColumnName: 'kid' }])
  platform: PlatformModel;
}

@Entity('private_key_model')
export class PrivateKeyModel extends KeyModel {
  @OneToOne(() => PlatformModel, (platform) => platform.privateKey, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([
    { name: 'kid', referencedColumnName: 'kid' },
    { name: 'platformUrl', referencedColumnName: 'platformUrl' },
    { name: 'clientId', referencedColumnName: 'clientId' },
  ])
  platform: PlatformModel;
}
