import { JwtPayload } from 'jsonwebtoken';
import { Platform } from './platform';
import { AccessTokenType, IdToken, ValidatedToken } from './types';
import { Provider } from '../provider/provider';
/**
 * @description Authentication class manages RSA keys and validation of tokens.
 */
export declare class Auth {
    /**
     * @description Generates a new keypair for a platform.
     * @param {string} kid
     * @param {string} platformUrl
     * @param {string} platformClientId
     * @returns {Promise<string>} KID for the keypair.
     */
    static generatePlatformKeyPair(kid: string, platformUrl: string, platformClientId: string): Promise<string>;
    /**
     * @description Resolves a promisse if the token is valid following LTI 1.3 standards.
     * @param {Provider} provider
     * @param {string} token - JWT token to be verified.
     * @param {Boolean} devMode - DevMode option.
     * @param {Object} validationParameters - Stored validation parameters retrieved from database.
     */
    static validateToken(provider: Provider, token: string, devMode: boolean, validationParameters: any): Promise<ValidatedToken>;
    /**
     * @description Verifies a token.
     * @param {string} token - Token to be verified.
     * @param {string} key - Key to verify the token.
     * @param {Object} validationParameters - Validation Parameters.
     * @param {Platform} platform - Issuer platform.
     */
    static verifyToken(token: string, key: string, validationParameters: any, platform: Platform): Promise<ValidatedToken>;
    /**
     * @description Validates de token based on the OIDC specifications.
     * @param {JwtPayload} token - Id token you wish to validate.
     * @param {Platform} platform - Platform object.
     * @param {Object} validationParameters - Validation parameters.
     */
    static oidcValidation(token: JwtPayload, platform: Platform, validationParameters: any): Promise<[boolean, boolean, boolean, boolean]>;
    /**
     * @description Validates Aud.
     * @param {JwtPayload} token - Id token you wish to validate.
     * @param {Platform} platform - Platform object.
     */
    static validateAud(token: JwtPayload, platform: Platform): Promise<boolean>;
    /**
     * @description Validates Aug.
     * @param {String} alg - Algorithm used.
     */
    static validateAlg(alg: string): Promise<boolean>;
    /**
     * @description Validates token max age.
     * @param {JwtPayload} token - Id token you wish to validate.
     * @param {number} maxAge - Max age allowed for the token.
     */
    static validateMaxAge(token: JwtPayload, maxAge: number): Promise<boolean>;
    /**
     * @description Validates Nonce.
     * @param {JwtPayload} token - Id token you wish to validate.
     */
    static validateNonce(token: JwtPayload): Promise<boolean>;
    /**
     * @description Validates de token based on the LTI 1.3 core claims specifications.
     * @param {JwtPayload & IdToken} token - Id token you wish to validate.
     */
    static claimValidation(token: JwtPayload & IdToken): Promise<void>;
    /**
     * @description Gets a new access token from the platform.
     * @param {String} scopes - Request scopes
     * @param {Platform} platform - Platform object of the platform you want to access.
     */
    static getAccessToken(scopes: string, platform: Platform): Promise<AccessTokenType>;
}
