import {BaseEntity, Column, Entity, OneToMany, OneToOne, PrimaryColumn, Unique,} from 'typeorm';
import {AuthConfigType, AuthTokenMethodEnum} from '../utils/types';
import {AccessTokenModel} from './access_token.entity';
import {IdTokenModel} from './id_token.entity';
import {PrivateKeyModel, PublicKeyModel} from './key.entity';

@Entity('platform_model')
@Unique(['platformUrl', 'clientId'])
@Unique(['platformUrl', 'clientId', 'kid'])
export class PlatformModel extends BaseEntity {
  @PrimaryColumn({ type: 'text' })
  kid: string;

  @Column({ type: 'text' })
  platformUrl: string;

  @Column({ type: 'text' })
  clientId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  authenticationEndpoint: string;

  @Column({ type: 'text' })
  accessTokenEndpoint: string;

  @Column({ type: 'text', nullable: true })
  authorizationServer?: string;

  @Column({ type: 'enum', enum: AuthTokenMethodEnum, default: 'JWK_SET' })
  authTokenMethod: AuthTokenMethodEnum;

  @Column({ type: 'text' })
  authTokenKey: string;

  authToken(): AuthConfigType {
    return {
      method: this.authTokenMethod,
      key: this.authTokenKey,
    };
  }

  @Column({ type: 'boolean', default: false })
  active: boolean;

  @Column({ type: 'boolean', default: false })
  dynamicallyRegistered: boolean;

  @Column({ type: 'text', nullable: true })
  registrationEndpoint?: string;

  @Column({ type: 'text', nullable: true })
  productFamilyCode?: string;

  @Column({ type: 'text', array: true, nullable: true })
  scopesSupported?: string[];

  @OneToMany(() => AccessTokenModel, (accessToken) => accessToken.platform)
  accessTokens: AccessTokenModel[];

  @OneToMany(() => IdTokenModel, (idToken) => idToken.platform)
  idTokens: IdTokenModel[];

  @OneToOne(() => PublicKeyModel, (pubk) => pubk.platform)
  publicKey: PublicKeyModel;

  @OneToOne(() => PrivateKeyModel, (prvk) => prvk.platform)
  privateKey: PrivateKeyModel;
}
