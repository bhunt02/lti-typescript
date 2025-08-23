import {BaseEntity} from 'typeorm';
import {AuthConfigType, AuthTokenMethodEnum} from '../utils/types';
import {AccessTokenModel} from './access_token.entity';
import {IdTokenModel} from './id_token.entity';
import {PrivateKeyModel, PublicKeyModel} from './key.entity';

export declare class PlatformModel extends BaseEntity {
    kid: string;
    platformUrl: string;
    clientId: string;
    name: string;
    authenticationEndpoint: string;
    accessTokenEndpoint: string;
    authorizationServer?: string;
    authTokenMethod: AuthTokenMethodEnum;
    authTokenKey: string;
    authToken(): AuthConfigType;
    active: boolean;
    accessTokens: AccessTokenModel[];
    idTokens: IdTokenModel[];
    publicKey: PublicKeyModel;
    privateKey: PrivateKeyModel;
}
