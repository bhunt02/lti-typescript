import {JwtPayload} from 'jsonwebtoken';
import {Platform} from './platform';
import {AccessTokenType, IdToken, ValidatedToken} from './types';
import {Provider} from '../provider/provider';

export declare class Auth {
    static generatePlatformKeyPair(kid: string, platformUrl: string, platformClientId: string): Promise<string>;
    static validateToken(provider: Provider, token: string, devMode: boolean, validationParameters: any): Promise<ValidatedToken>;
    static verifyToken(token: string, key: string, validationParameters: any, platform: Platform): Promise<ValidatedToken>;
    static oidcValidation(token: JwtPayload, platform: Platform, validationParameters: any): Promise<[boolean, boolean, boolean, boolean]>;
    static validateAud(token: JwtPayload, platform: Platform): Promise<boolean>;
    static validateAlg(alg: string): Promise<boolean>;
    static validateMaxAge(token: JwtPayload, maxAge: number): Promise<boolean>;
    static validateNonce(token: JwtPayload): Promise<boolean>;
    static claimValidation(token: IdToken): Promise<void>;
    static getAccessToken(scopes: string, platform: Platform): Promise<AccessTokenType>;
}
