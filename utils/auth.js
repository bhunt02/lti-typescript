"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const database_1 = require("./database");
const key_entity_1 = require("../entities/key.entity");
const crypto = require("crypto");
const Jwk = require("rasha");
const jwt = require("jsonwebtoken");
const debug_1 = require("./debug");
const access_token_entity_1 = require("../entities/access_token.entity");
const nonce_entity_1 = require("../entities/nonce.entity");
class Auth {
    static async generatePlatformKeyPair(kid, platformUrl, platformClientId) {
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
        const pubkeyobj = {
            key: publicKey,
            kid,
        };
        const privkeyobj = {
            key: privateKey,
            kid,
        };
        await database_1.Database.save(key_entity_1.PublicKeyModel, {
            kid,
            platformUrl,
            clientId: platformClientId,
            data: pubkeyobj,
        });
        await database_1.Database.save(key_entity_1.PrivateKeyModel, {
            kid,
            platformUrl,
            clientId: platformClientId,
            data: privkeyobj,
        });
        return kid;
    }
    static async validateToken(provider, token, devMode, validationParameters) {
        const decoded = jwt.decode(token, { complete: true });
        if (!decoded)
            throw new Error('INVALID_JWT_RECEIVED');
        const payload = decoded.payload;
        const kid = decoded.header.kid;
        validationParameters.alg = decoded.header.alg;
        debug_1.Debug.log(this, 'Attempting to validate iss claim');
        debug_1.Debug.log(this, 'Request Iss claim: ' + validationParameters.iss);
        debug_1.Debug.log(this, 'Response Iss claim: ' + payload.iss);
        if (!validationParameters.iss) {
            if (!devMode) {
                throw new Error('MISSING_VALIDATION_COOKIE');
            }
            else {
                debug_1.Debug.log(this, 'Dev Mode enabled: Missing state validation cookies will be ignored');
            }
        }
        else if (validationParameters.iss !== payload.iss) {
            throw new Error('ISS_CLAIM_DOES_NOT_MATCH');
        }
        debug_1.Debug.log(this, 'Attempting to retrieve registered platform');
        let platform;
        if (!Array.isArray(payload.aud)) {
            platform = await provider.getPlatform(payload.iss, payload.aud);
        }
        else {
            for (const aud of payload.aud) {
                platform = await provider.getPlatform(payload.iss, aud);
                if (platform)
                    break;
            }
        }
        if (!platform)
            throw new Error('UNREGISTERED_PLATFORM');
        if (!platform.active)
            throw new Error('PLATFORM_NOT_ACTIVATED');
        const authConfig = platform.authToken;
        switch (authConfig.method) {
            case 'JWK_SET': {
                debug_1.Debug.log(this, 'Retrieving key from jwk_set');
                if (!kid)
                    throw new Error('KID_NOT_FOUND');
                const keysEndpoint = authConfig.key;
                const res = await platform.api.get(keysEndpoint);
                const keyset = res.keys;
                if (!keyset)
                    throw new Error('KEYSET_NOT_FOUND');
                const jwk = keyset.find((key) => {
                    return key.kid === kid;
                });
                if (!jwk)
                    throw new Error('KEY_NOT_FOUND');
                debug_1.Debug.log(this, 'Converting JWK key to PEM key');
                const key = await Jwk.export({ jwk });
                return await this.verifyToken(token, key, validationParameters, platform);
            }
            case 'JWK_KEY': {
                debug_1.Debug.log(this, 'Retrieving key from jwk_key');
                if (!authConfig.key)
                    throw new Error('KEY_NOT_FOUND');
                debug_1.Debug.log(this, 'Converting JWK key to PEM key');
                let jwk = authConfig.key;
                if (typeof jwk === 'string')
                    jwk = JSON.parse(jwk);
                const key = await Jwk.export({ jwk });
                return await this.verifyToken(token, key, validationParameters, platform);
            }
            case 'RSA_KEY': {
                debug_1.Debug.log(this, 'Retrieving key from rsa_key');
                const key = authConfig.key;
                if (!key)
                    throw new Error('KEY_NOT_FOUND');
                return await this.verifyToken(token, key, validationParameters, platform);
            }
            default: {
                debug_1.Debug.log(this, 'No auth configuration found for platform');
                throw new Error('AUTHCONFIG_NOT_FOUND');
            }
        }
    }
    static async verifyToken(token, key, validationParameters, platform) {
        debug_1.Debug.log(this, 'Attempting to verify JWT with the given key');
        const verified = jwt.verify(token, key, {
            algorithms: [validationParameters.alg],
            clockTimestamp: Date.now() / 1000,
        });
        await this.oidcValidation(verified, platform, validationParameters);
        await this.claimValidation(verified);
        verified.clientId = platform.clientId;
        verified.platformId = platform.kid;
        return verified;
    }
    static async oidcValidation(token, platform, validationParameters) {
        debug_1.Debug.log(this, 'Token signature verified');
        debug_1.Debug.log(this, 'Initiating OIDC aditional validation steps');
        const aud = this.validateAud(token, platform);
        const alg = this.validateAlg(validationParameters.alg);
        const maxAge = this.validateMaxAge(token, validationParameters.maxAge);
        const nonce = this.validateNonce(token);
        return Promise.all([aud, alg, maxAge, nonce]);
    }
    static async validateAud(token, platform) {
        debug_1.Debug.log(this, "Validating if aud (Audience) claim matches the value of the tool's clientId given by the platform");
        debug_1.Debug.log(this, 'Aud claim: ' + token.aud);
        debug_1.Debug.log(this, "Tool's clientId: " + platform.clientId);
        if (Array.isArray(token.aud)) {
            debug_1.Debug.log(this, 'More than one aud listed, searching for azp claim');
            if (token.azp && token.azp !== platform.clientId)
                throw new Error('AZP_DOES_NOT_MATCH_CLIENTID');
        }
        else {
            return token.aud === platform.clientId;
        }
    }
    static async validateAlg(alg) {
        debug_1.Debug.log(this, 'Checking alg claim. Alg: ' + alg);
        if (alg !== 'RS256')
            throw new Error('ALG_NOT_RS256');
        return true;
    }
    static async validateMaxAge(token, maxAge) {
        debug_1.Debug.log(this, 'Max age parameter: ', maxAge);
        if (!maxAge)
            return true;
        debug_1.Debug.log(this, 'Checking iat claim to prevent old tokens from being passed.');
        debug_1.Debug.log(this, 'Iat claim: ' + token.iat);
        debug_1.Debug.log(this, 'Exp claim: ' + token.exp);
        const curTime = Date.now() / 1000;
        debug_1.Debug.log(this, 'Current_time: ' + curTime);
        const timePassed = curTime - token.iat;
        debug_1.Debug.log(this, 'Time passed: ' + timePassed);
        if (timePassed > maxAge)
            throw new Error('TOKEN_TOO_OLD');
        return true;
    }
    static async validateNonce(token) {
        debug_1.Debug.log(this, 'Validating nonce');
        debug_1.Debug.log(this, 'Nonce: ' + token.nonce);
        if (await database_1.Database.findOne(nonce_entity_1.NonceModel, { where: { nonce: token.nonce } }))
            throw new Error('NONCE_ALREADY_RECEIVED');
        debug_1.Debug.log(this, 'Storing nonce');
        await database_1.Database.save(nonce_entity_1.NonceModel, { nonce: token.nonce });
        return true;
    }
    static async claimValidation(token) {
        debug_1.Debug.log(this, 'Initiating LTI 1.3 core claims validation');
        debug_1.Debug.log(this, 'Checking Message type claim');
        if (token['https://purl.imsglobal.org/spec/lti/claim/message_type'] !==
            'LtiResourceLinkRequest' &&
            token['https://purl.imsglobal.org/spec/lti/claim/message_type'] !==
                'LtiDeepLinkingRequest')
            throw new Error('NO_MESSAGE_TYPE_CLAIM');
        if (token['https://purl.imsglobal.org/spec/lti/claim/message_type'] ===
            'LtiResourceLinkRequest') {
            debug_1.Debug.log(this, 'Checking Target Link Uri claim');
            if (!token['https://purl.imsglobal.org/spec/lti/claim/target_link_uri'])
                throw new Error('NO_TARGET_LINK_URI_CLAIM');
            debug_1.Debug.log(this, 'Checking Resource Link Id claim');
            if (!token['https://purl.imsglobal.org/spec/lti/claim/resource_link'] ||
                !token['https://purl.imsglobal.org/spec/lti/claim/resource_link'].id)
                throw new Error('NO_RESOURCE_LINK_ID_CLAIM');
        }
        debug_1.Debug.log(this, 'Checking LTI Version claim');
        if (!token['https://purl.imsglobal.org/spec/lti/claim/version'])
            throw new Error('NO_LTI_VERSION_CLAIM');
        if (token['https://purl.imsglobal.org/spec/lti/claim/version'] !== '1.3.0')
            throw new Error('WRONG_LTI_VERSION_CLAIM');
        debug_1.Debug.log(this, 'Checking Deployment Id claim');
        if (!token['https://purl.imsglobal.org/spec/lti/claim/deployment_id'])
            throw new Error('NO_DEPLOYMENT_ID_CLAIM');
        debug_1.Debug.log(this, 'Checking Sub claim');
        if (!token.sub)
            throw new Error('NO_SUB_CLAIM');
        debug_1.Debug.log(this, 'Checking Roles claim');
        if (!token['https://purl.imsglobal.org/spec/lti/claim/roles'])
            throw new Error('NO_ROLES_CLAIM');
    }
    static async getAccessToken(scopes, platform) {
        const confjwt = {
            sub: platform.clientId,
            iss: platform.platformUrl,
            aud: platform.authorizationServer,
            jti: encodeURIComponent([...Array(25)]
                .map(() => ((Math.random() * 36) | 0).toString(36))
                .join(``)),
        };
        const token = jwt.sign(confjwt, await platform.platformPrivateKey(), {
            algorithm: 'RS256',
            expiresIn: 60,
            keyid: platform.kid,
        });
        debug_1.Debug.log(this, 'Awaiting return from the platform');
        const params = {
            grant_type: 'client_credentials',
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            client_assertion: token,
            scope: scopes,
        };
        const searchParams = new URLSearchParams(params).toString();
        const url = ['canvas'].includes(platform.productFamilyCode)
            ? `${platform.accessTokenEndpoint}?${params}`
            : platform.accessTokenEndpoint;
        const init = {
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        };
        if (platform.platformUrl.toLowerCase().includes('canvas')) {
            delete init.body;
        }
        const access = await platform.api.post(url, init);
        debug_1.Debug.log(this, 'Successfully generated new access_token');
        await database_1.Database.save(access_token_entity_1.AccessTokenModel, {
            platformUrl: platform.platformUrl,
            clientId: platform.clientId,
            scopes,
            data: { ...access },
        });
        return access;
    }
}
exports.Auth = Auth;
//# sourceMappingURL=auth.js.map