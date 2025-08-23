"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
var database_1 = require("./database");
var key_entity_1 = require("../entities/key.entity");
var crypto = require("crypto");
var Jwk = require("rasha");
var jwt = require("jsonwebtoken");
var debug_1 = require("./debug");
var access_token_entity_1 = require("../entities/access_token.entity");
var nonce_entity_1 = require("../entities/nonce.entity");
var Auth = (function () {
    function Auth() {
    }
    Auth.generatePlatformKeyPair = function (kid, platformUrl, platformClientId) {
        return __awaiter(this, void 0, void 0, function () {
            var keys, publicKey, privateKey, pubkeyobj, privkeyobj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        keys = crypto.generateKeyPairSync('rsa', {
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
                        publicKey = keys.publicKey, privateKey = keys.privateKey;
                        pubkeyobj = {
                            key: publicKey,
                            kid: kid,
                        };
                        privkeyobj = {
                            key: privateKey,
                            kid: kid,
                        };
                        return [4, database_1.Database.save(key_entity_1.PublicKeyModel, {
                                kid: kid,
                                platformUrl: platformUrl,
                                clientId: platformClientId,
                                data: pubkeyobj,
                            })];
                    case 1:
                        _a.sent();
                        return [4, database_1.Database.save(key_entity_1.PrivateKeyModel, {
                                kid: kid,
                                platformUrl: platformUrl,
                                clientId: platformClientId,
                                data: privkeyobj,
                            })];
                    case 2:
                        _a.sent();
                        return [2, kid];
                }
            });
        });
    };
    Auth.validateToken = function (provider, token, devMode, validationParameters) {
        return __awaiter(this, void 0, void 0, function () {
            var decoded, payload, kid, platform, _i, _a, aud, authConfig, _b, keysEndpoint, res, keyset, jwk, key, jwk, key, key;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        decoded = jwt.decode(token, { complete: true });
                        if (!decoded)
                            throw new Error('INVALID_JWT_RECEIVED');
                        payload = decoded.payload;
                        kid = decoded.header.kid;
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
                        if (!!Array.isArray(payload.aud)) return [3, 2];
                        return [4, provider.getPlatform(payload.iss, payload.aud)];
                    case 1:
                        platform = _c.sent();
                        return [3, 6];
                    case 2:
                        _i = 0, _a = payload.aud;
                        _c.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3, 6];
                        aud = _a[_i];
                        return [4, provider.getPlatform(payload.iss, aud)];
                    case 4:
                        platform = _c.sent();
                        if (platform)
                            return [3, 6];
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3, 3];
                    case 6:
                        if (!platform)
                            throw new Error('UNREGISTERED_PLATFORM');
                        if (!platform.active)
                            throw new Error('PLATFORM_NOT_ACTIVATED');
                        authConfig = platform.authToken;
                        _b = authConfig.method;
                        switch (_b) {
                            case 'JWK_SET': return [3, 7];
                            case 'JWK_KEY': return [3, 11];
                            case 'RSA_KEY': return [3, 14];
                        }
                        return [3, 16];
                    case 7:
                        debug_1.Debug.log(this, 'Retrieving key from jwk_set');
                        if (!kid)
                            throw new Error('KID_NOT_FOUND');
                        keysEndpoint = authConfig.key;
                        return [4, platform.api.get(keysEndpoint)];
                    case 8:
                        res = _c.sent();
                        keyset = res.keys;
                        if (!keyset)
                            throw new Error('KEYSET_NOT_FOUND');
                        jwk = keyset.find(function (key) {
                            return key.kid === kid;
                        });
                        if (!jwk)
                            throw new Error('KEY_NOT_FOUND');
                        debug_1.Debug.log(this, 'Converting JWK key to PEM key');
                        return [4, Jwk.export({ jwk: jwk })];
                    case 9:
                        key = _c.sent();
                        return [4, this.verifyToken(token, key, validationParameters, platform)];
                    case 10: return [2, _c.sent()];
                    case 11:
                        debug_1.Debug.log(this, 'Retrieving key from jwk_key');
                        if (!authConfig.key)
                            throw new Error('KEY_NOT_FOUND');
                        debug_1.Debug.log(this, 'Converting JWK key to PEM key');
                        jwk = authConfig.key;
                        if (typeof jwk === 'string')
                            jwk = JSON.parse(jwk);
                        return [4, Jwk.export({ jwk: jwk })];
                    case 12:
                        key = _c.sent();
                        return [4, this.verifyToken(token, key, validationParameters, platform)];
                    case 13: return [2, _c.sent()];
                    case 14:
                        debug_1.Debug.log(this, 'Retrieving key from rsa_key');
                        key = authConfig.key;
                        if (!key)
                            throw new Error('KEY_NOT_FOUND');
                        return [4, this.verifyToken(token, key, validationParameters, platform)];
                    case 15: return [2, _c.sent()];
                    case 16:
                        {
                            debug_1.Debug.log(this, 'No auth configuration found for platform');
                            throw new Error('AUTHCONFIG_NOT_FOUND');
                        }
                        _c.label = 17;
                    case 17: return [2];
                }
            });
        });
    };
    Auth.verifyToken = function (token, key, validationParameters, platform) {
        return __awaiter(this, void 0, void 0, function () {
            var verified;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        debug_1.Debug.log(this, 'Attempting to verify JWT with the given key');
                        verified = jwt.verify(token, key, {
                            algorithms: [validationParameters.alg],
                            clockTimestamp: Date.now() / 1000,
                        });
                        return [4, this.oidcValidation(verified, platform, validationParameters)];
                    case 1:
                        _a.sent();
                        return [4, this.claimValidation(verified)];
                    case 2:
                        _a.sent();
                        verified.clientId = platform.clientId;
                        verified.platformId = platform.kid;
                        return [2, verified];
                }
            });
        });
    };
    Auth.oidcValidation = function (token, platform, validationParameters) {
        return __awaiter(this, void 0, void 0, function () {
            var aud, alg, maxAge, nonce;
            return __generator(this, function (_a) {
                debug_1.Debug.log(this, 'Token signature verified');
                debug_1.Debug.log(this, 'Initiating OIDC aditional validation steps');
                aud = this.validateAud(token, platform);
                alg = this.validateAlg(validationParameters.alg);
                maxAge = this.validateMaxAge(token, validationParameters.maxAge);
                nonce = this.validateNonce(token);
                return [2, Promise.all([aud, alg, maxAge, nonce])];
            });
        });
    };
    Auth.validateAud = function (token, platform) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                debug_1.Debug.log(this, "Validating if aud (Audience) claim matches the value of the tool's clientId given by the platform");
                debug_1.Debug.log(this, 'Aud claim: ' + token.aud);
                debug_1.Debug.log(this, "Tool's clientId: " + platform.clientId);
                if (Array.isArray(token.aud)) {
                    debug_1.Debug.log(this, 'More than one aud listed, searching for azp claim');
                    if (token.azp && token.azp !== platform.clientId)
                        throw new Error('AZP_DOES_NOT_MATCH_CLIENTID');
                }
                else {
                    return [2, token.aud === platform.clientId];
                }
                return [2];
            });
        });
    };
    Auth.validateAlg = function (alg) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                debug_1.Debug.log(this, 'Checking alg claim. Alg: ' + alg);
                if (alg !== 'RS256')
                    throw new Error('ALG_NOT_RS256');
                return [2, true];
            });
        });
    };
    Auth.validateMaxAge = function (token, maxAge) {
        return __awaiter(this, void 0, void 0, function () {
            var curTime, timePassed;
            return __generator(this, function (_a) {
                debug_1.Debug.log(this, 'Max age parameter: ', maxAge);
                if (!maxAge)
                    return [2, true];
                debug_1.Debug.log(this, 'Checking iat claim to prevent old tokens from being passed.');
                debug_1.Debug.log(this, 'Iat claim: ' + token.iat);
                debug_1.Debug.log(this, 'Exp claim: ' + token.exp);
                curTime = Date.now() / 1000;
                debug_1.Debug.log(this, 'Current_time: ' + curTime);
                timePassed = curTime - token.iat;
                debug_1.Debug.log(this, 'Time passed: ' + timePassed);
                if (timePassed > maxAge)
                    throw new Error('TOKEN_TOO_OLD');
                return [2, true];
            });
        });
    };
    Auth.validateNonce = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        debug_1.Debug.log(this, 'Validating nonce');
                        debug_1.Debug.log(this, 'Nonce: ' + token.nonce);
                        return [4, database_1.Database.findOne(nonce_entity_1.NonceModel, { where: { nonce: token.nonce } })];
                    case 1:
                        if (_a.sent())
                            throw new Error('NONCE_ALREADY_RECEIVED');
                        debug_1.Debug.log(this, 'Storing nonce');
                        return [4, database_1.Database.save(nonce_entity_1.NonceModel, { nonce: token.nonce })];
                    case 2:
                        _a.sent();
                        return [2, true];
                }
            });
        });
    };
    Auth.claimValidation = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
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
                return [2];
            });
        });
    };
    Auth.getAccessToken = function (scopes, platform) {
        return __awaiter(this, void 0, void 0, function () {
            var confjwt, token, _a, _b, _c, access;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        confjwt = {
                            sub: platform.clientId,
                            iss: platform.platformUrl,
                            aud: platform.authorizationServer,
                            jti: encodeURIComponent(__spreadArray([], Array(25), true).map(function () { return ((Math.random() * 36) | 0).toString(36); })
                                .join("")),
                        };
                        _b = (_a = jwt).sign;
                        _c = [confjwt];
                        return [4, platform.platformPrivateKey()];
                    case 1:
                        token = _b.apply(_a, _c.concat([_d.sent(), {
                                algorithm: 'RS256',
                                expiresIn: 60,
                                keyid: platform.kid,
                            }]));
                        debug_1.Debug.log(this, 'Awaiting return from the platform');
                        return [4, platform.api.post(platform.accessTokenEndpoint, {
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    grant_type: 'client_credentials',
                                    client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                                    client_assertion: token,
                                    scope: scopes,
                                }),
                            })];
                    case 2:
                        access = _d.sent();
                        debug_1.Debug.log(this, 'Successfully generated new access_token');
                        return [4, database_1.Database.save(access_token_entity_1.AccessTokenModel, {
                                platformUrl: platform.platformUrl,
                                clientId: platform.clientId,
                                scopes: scopes,
                                data: __assign({}, access),
                            })];
                    case 3:
                        _d.sent();
                        return [2, access];
                }
            });
        });
    };
    return Auth;
}());
exports.Auth = Auth;
