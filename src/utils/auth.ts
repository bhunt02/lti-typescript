import {Database} from './database';
import {PrivateKeyModel, PublicKeyModel} from '../entities/key.entity';
import * as crypto from 'crypto';
import * as Jwk from 'rasha';
import * as jwt from 'jsonwebtoken';
import {JwtPayload} from 'jsonwebtoken';
import {Debug} from './debug';
import {Platform} from './platform';
import {AccessTokenModel} from '../entities/access_token.entity';
import {AccessTokenType, IdToken, KeyObject, ValidatedToken,} from './types';
import {NonceModel} from '../entities/nonce.entity';
import {Provider} from '../provider/provider';

/**
 * @description Authentication class manages RSA keys and validation of tokens.
 */
export class Auth {
  /**
   * @description Generates a new keypair for a platform.
   * @param {string} kid
   * @param {string} platformUrl
   * @param {string} platformClientId
   * @returns {Promise<string>} KID for the keypair.
   */
  static async generatePlatformKeyPair(
    kid: string,
    platformUrl: string,
    platformClientId: string,
  ): Promise<string> {
    const keys = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
    });

    const { publicKey, privateKey } = keys;

    const pubkeyobj: KeyObject = {
      key: publicKey,
      kid,
    };
    const privkeyobj: KeyObject = {
      key: privateKey,
      kid,
    };

    await Database.save(PublicKeyModel, {
      kid,
      platformUrl,
      clientId: platformClientId,
      data: pubkeyobj as unknown as string,
    });
    await Database.save(PrivateKeyModel, {
      kid,
      platformUrl,
      clientId: platformClientId,
      data: privkeyobj as unknown as string,
    });
    return kid;
  }

  /**
   * @description Resolves a promisse if the token is valid following LTI 1.3 standards.
   * @param {Provider} provider
   * @param {string} token - JWT token to be verified.
   * @param {Boolean} devMode - DevMode option.
   * @param {Object} validationParameters - Stored validation parameters retrieved from database.
   */
  static async validateToken(
    provider: Provider,
    token: string,
    devMode: boolean,
    validationParameters: any,
  ): Promise<ValidatedToken> {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) throw new Error('INVALID_JWT_RECEIVED');

    const payload = decoded.payload as JwtPayload;

    const kid = decoded.header.kid;
    validationParameters.alg = decoded.header.alg;

    Debug.log(this, 'Attempting to validate iss claim');
    Debug.log(this, 'Request Iss claim: ' + validationParameters.iss);
    Debug.log(this, 'Response Iss claim: ' + payload.iss);
    if (!validationParameters.iss) {
      if (!devMode) {
        throw new Error('MISSING_VALIDATION_COOKIE');
      } else {
        Debug.log(
          this,
          'Dev Mode enabled: Missing state validation cookies will be ignored',
        );
      }
    } else if (validationParameters.iss !== payload.iss) {
      throw new Error('ISS_CLAIM_DOES_NOT_MATCH');
    }

    Debug.log(this, 'Attempting to retrieve registered platform');

    let platform: Platform | undefined;
    if (!Array.isArray(payload.aud)) {
      platform = await provider.getPlatform(payload.iss, payload.aud);
    } else {
      for (const aud of payload.aud) {
        platform = await provider.getPlatform(payload.iss, aud);
        if (platform) break;
      }
    }
    if (!platform) throw new Error('UNREGISTERED_PLATFORM');
    if (!platform.active) throw new Error('PLATFORM_NOT_ACTIVATED');

    const authConfig = platform.authToken;
    /* istanbul ignore next */
    switch (authConfig.method) {
      case 'JWK_SET': {
        Debug.log(this, 'Retrieving key from jwk_set');
        if (!kid) throw new Error('KID_NOT_FOUND');

        const keysEndpoint = authConfig.key;
        const res: { keys: any[] } = await platform.api.get(keysEndpoint);
        const keyset = res.keys;
        if (!keyset) throw new Error('KEYSET_NOT_FOUND');
        const jwk = keyset.find((key: any) => {
          return key.kid === kid;
        });
        if (!jwk) throw new Error('KEY_NOT_FOUND');
        Debug.log(this, 'Converting JWK key to PEM key');
        const key = await Jwk.export({ jwk });

        return await this.verifyToken(
          token,
          key,
          validationParameters,
          platform,
        );
      }
      case 'JWK_KEY': {
        Debug.log(this, 'Retrieving key from jwk_key');
        if (!authConfig.key) throw new Error('KEY_NOT_FOUND');
        Debug.log(this, 'Converting JWK key to PEM key');
        let jwk = authConfig.key;
        if (typeof jwk === 'string') jwk = JSON.parse(jwk);
        const key = await Jwk.export({ jwk });
        return await this.verifyToken(
          token,
          key,
          validationParameters,
          platform,
        );
      }
      case 'RSA_KEY': {
        Debug.log(this, 'Retrieving key from rsa_key');
        const key = authConfig.key;
        if (!key) throw new Error('KEY_NOT_FOUND');
        return await this.verifyToken(
          token,
          key,
          validationParameters,
          platform,
        );
      }
      default: {
        Debug.log(this, 'No auth configuration found for platform');
        throw new Error('AUTHCONFIG_NOT_FOUND');
      }
    }
  }

  /**
   * @description Verifies a token.
   * @param {string} token - Token to be verified.
   * @param {string} key - Key to verify the token.
   * @param {Object} validationParameters - Validation Parameters.
   * @param {Platform} platform - Issuer platform.
   */
  static async verifyToken(
    token: string,
    key: string,
    validationParameters: any,
    platform: Platform,
  ): Promise<ValidatedToken> {
    Debug.log(this, 'Attempting to verify JWT with the given key');
    const verified = jwt.verify(token, key, {
      algorithms: [validationParameters.alg],
      clockTimestamp: Date.now() / 1000,
    }) as JwtPayload;
    await this.oidcValidation(verified, platform, validationParameters);
    await this.claimValidation(verified as IdToken);

    // Adding clientId and platformId information to token
    verified.clientId = platform.clientId;
    verified.platformId = platform.kid;
    return verified as ValidatedToken;
  }

  /**
   * @description Validates de token based on the OIDC specifications.
   * @param {JwtPayload} token - Id token you wish to validate.
   * @param {Platform} platform - Platform object.
   * @param {Object} validationParameters - Validation parameters.
   */
  static async oidcValidation(
    token: JwtPayload,
    platform: Platform,
    validationParameters: any,
  ) {
    Debug.log(this, 'Token signature verified');
    Debug.log(this, 'Initiating OIDC aditional validation steps');

    const aud = this.validateAud(token, platform);
    const alg = this.validateAlg(validationParameters.alg);
    const maxAge = this.validateMaxAge(token, validationParameters.maxAge);
    const nonce = this.validateNonce(token);

    return Promise.all([aud, alg, maxAge, nonce]);
  }

  /**
   * @description Validates Aud.
   * @param {JwtPayload} token - Id token you wish to validate.
   * @param {Platform} platform - Platform object.
   */
  static async validateAud(token: JwtPayload, platform: Platform) {
    Debug.log(
      this,
      "Validating if aud (Audience) claim matches the value of the tool's clientId given by the platform",
    );
    Debug.log(this, 'Aud claim: ' + token.aud);
    Debug.log(this, "Tool's clientId: " + platform.clientId);
    if (Array.isArray(token.aud)) {
      Debug.log(this, 'More than one aud listed, searching for azp claim');
      if (token.azp && token.azp !== platform.clientId)
        throw new Error('AZP_DOES_NOT_MATCH_CLIENTID');
    } else {
      return token.aud === platform.clientId;
    }
  }

  /**
   * @description Validates Aug.
   * @param {String} alg - Algorithm used.
   */
  static async validateAlg(alg: string) {
    Debug.log(this, 'Checking alg claim. Alg: ' + alg);
    if (alg !== 'RS256') throw new Error('ALG_NOT_RS256');
    return true;
  }

  /**
   * @description Validates token max age.
   * @param {JwtPayload} token - Id token you wish to validate.
   * @param {number} maxAge - Max age allowed for the token.
   */
  static async validateMaxAge(token: JwtPayload, maxAge: number) {
    Debug.log(this, 'Max age parameter: ', maxAge);
    if (!maxAge) return true;
    Debug.log(
      this,
      'Checking iat claim to prevent old tokens from being passed.',
    );
    Debug.log(this, 'Iat claim: ' + token.iat);
    Debug.log(this, 'Exp claim: ' + token.exp);
    const curTime = Date.now() / 1000;
    Debug.log(this, 'Current_time: ' + curTime);
    const timePassed = curTime - token.iat;
    Debug.log(this, 'Time passed: ' + timePassed);
    if (timePassed > maxAge) throw new Error('TOKEN_TOO_OLD');
    return true;
  }

  /**
   * @description Validates Nonce.
   * @param {JwtPayload} token - Id token you wish to validate.
   */
  static async validateNonce(token: JwtPayload) {
    Debug.log(this, 'Validating nonce');
    Debug.log(this, 'Nonce: ' + token.nonce);

    if (await Database.findOne(NonceModel, { where: { nonce: token.nonce } }))
      throw new Error('NONCE_ALREADY_RECEIVED');
    Debug.log(this, 'Storing nonce');
    await Database.save(NonceModel, { nonce: token.nonce });

    return true;
  }

  /**
   * @description Validates de token based on the LTI 1.3 core claims specifications.
   * @param {JwtPayload & IdToken} token - Id token you wish to validate.
   */
  static async claimValidation(token: JwtPayload & IdToken) {
    Debug.log(this, 'Initiating LTI 1.3 core claims validation');

    Debug.log(this, 'Checking Message type claim');
    if (
      token['https://purl.imsglobal.org/spec/lti/claim/message_type'] !==
        'LtiResourceLinkRequest' &&
      token['https://purl.imsglobal.org/spec/lti/claim/message_type'] !==
        'LtiDeepLinkingRequest'
    )
      throw new Error('NO_MESSAGE_TYPE_CLAIM');

    if (
      token['https://purl.imsglobal.org/spec/lti/claim/message_type'] ===
      'LtiResourceLinkRequest'
    ) {
      Debug.log(this, 'Checking Target Link Uri claim');
      if (!token['https://purl.imsglobal.org/spec/lti/claim/target_link_uri'])
        throw new Error('NO_TARGET_LINK_URI_CLAIM');

      Debug.log(this, 'Checking Resource Link Id claim');
      if (
        !token['https://purl.imsglobal.org/spec/lti/claim/resource_link'] ||
        !token['https://purl.imsglobal.org/spec/lti/claim/resource_link'].id
      )
        throw new Error('NO_RESOURCE_LINK_ID_CLAIM');
    }

    Debug.log(this, 'Checking LTI Version claim');
    if (!token['https://purl.imsglobal.org/spec/lti/claim/version'])
      throw new Error('NO_LTI_VERSION_CLAIM');
    if (token['https://purl.imsglobal.org/spec/lti/claim/version'] !== '1.3.0')
      throw new Error('WRONG_LTI_VERSION_CLAIM');

    Debug.log(this, 'Checking Deployment Id claim');
    if (!token['https://purl.imsglobal.org/spec/lti/claim/deployment_id'])
      throw new Error('NO_DEPLOYMENT_ID_CLAIM');

    Debug.log(this, 'Checking Sub claim');
    if (!token.sub) throw new Error('NO_SUB_CLAIM');

    Debug.log(this, 'Checking Roles claim');
    if (!token['https://purl.imsglobal.org/spec/lti/claim/roles'])
      throw new Error('NO_ROLES_CLAIM');
  }

  /**
   * @description Gets a new access token from the platform.
   * @param {String} scopes - Request scopes
   * @param {Platform} platform - Platform object of the platform you want to access.
   */
  static async getAccessToken(
    scopes: string,
    platform: Platform,
  ): Promise<AccessTokenType> {
    const confjwt = {
      sub: platform.clientId,
      iss: platform.platformUrl,
      aud: platform.authorizationServer,
      jti: encodeURIComponent(
        [...Array(25)]
          .map(() => ((Math.random() * 36) | 0).toString(36))
          .join(``),
      ),
    };

    const token = jwt.sign(confjwt, await platform.platformPrivateKey(), {
      algorithm: 'RS256',
      expiresIn: 60,
      keyid: platform.kid,
    });

    Debug.log(this, 'Awaiting return from the platform');
    const access: AccessTokenType = await platform.api.post(
      platform.accessTokenEndpoint,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_assertion_type:
            'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
          client_assertion: token,
          scope: scopes,
        }),
      },
    );
    Debug.log(this, 'Successfully generated new access_token');

    await Database.save(AccessTokenModel, {
      platformUrl: platform.platformUrl,
      clientId: platform.clientId,
      scopes,
      data: { ...access } as unknown as string,
    });

    return access;
  }
}
