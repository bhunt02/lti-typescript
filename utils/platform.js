"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Platform = void 0;
const platform_entity_1 = require("../entities/platform.entity");
const database_1 = require("./database");
const key_entity_1 = require("../entities/key.entity");
const access_token_entity_1 = require("../entities/access_token.entity");
const auth_1 = require("./auth");
const debug_1 = require("./debug");
const axios_1 = require("axios");
/**
 * @description Class representing a registered platform.
 */
class Platform {
    constructor(platformModel) {
        this.platformModel = platformModel;
        this.api = new PlatformApi();
    }
    get platformUrl() {
        return this.platformModel.platformUrl;
    }
    get clientId() {
        return this.platformModel.clientId;
    }
    get name() {
        return this.platformModel.name;
    }
    get authenticationEndpoint() {
        return this.platformModel.authenticationEndpoint;
    }
    get accessTokenEndpoint() {
        return this.platformModel.accessTokenEndpoint;
    }
    get authorizationServer() {
        return (this.platformModel.authorizationServer ??
            this.platformModel.accessTokenEndpoint);
    }
    get kid() {
        return this.platformModel.kid;
    }
    get authToken() {
        return this.platformModel.authToken();
    }
    get active() {
        return this.platformModel.active;
    }
    get dynamicallyRegistered() {
        return this.platformModel.dynamicallyRegistered;
    }
    get productFamilyCode() {
        return this.platformModel.productFamilyCode;
    }
    get registrationEndpoint() {
        return this.platformModel.registrationEndpoint;
    }
    get scopesSupported() {
        return this.platformModel.scopesSupported;
    }
    /**
     * @description Sets/Gets the platform name.
     * @param {string} name - Platform name.
     */
    async setName(name) {
        await database_1.Database.update(platform_entity_1.PlatformModel, {
            name,
        }, {
            platformUrl: this.platformUrl,
            clientId: this.clientId,
        });
        await this.platformModel.reload();
    }
    /**
     * @description Sets the platform status.
     * @param {Boolean} active Whether the Platform is active or not.
     */
    async setActive(active) {
        await database_1.Database.update(platform_entity_1.PlatformModel, {
            active,
        }, {
            platformUrl: this.platformUrl,
            clientId: this.clientId,
        });
        await this.platformModel.reload();
    }
    /**
     * @description Gets the RSA public key assigned to the platform.
     *
     */
    async platformPublicKey() {
        const key = await database_1.Database.findOne(key_entity_1.PublicKeyModel, {
            where: { kid: this.kid },
        });
        return key.data;
    }
    /**
     * @description Gets the RSA private key assigned to the platform.
     *
     */
    async platformPrivateKey() {
        const key = await database_1.Database.findOne(key_entity_1.PrivateKeyModel, {
            where: { kid: this.kid },
        });
        return key.data;
    }
    /**
     * @description Sets the platform authorization configurations used to validate it's messages.
     * @param {string} method Method of authorization "RSA_KEY" or "JWK_KEY" or "JWK_SET".
     * @param {string} key Either the RSA public key provided by the platform, or the JWK key, or the JWK keyset address.
     */
    async setAuthConfig(method, key) {
        await database_1.Database.update(platform_entity_1.PlatformModel, {
            authTokenMethod: method || this.authToken.method,
            authTokenKey: key || this.authToken.key,
        }, {
            platformUrl: this.platformUrl,
            clientId: this.clientId,
        });
        await this.platformModel.reload();
    }
    /**
     * @description Sets the platform authorization endpoint used to perform the OIDC login.
     * @param {string} authenticationEndpoint Platform authentication endpoint.
     */
    async setAuthenticationEndpoint(authenticationEndpoint) {
        await database_1.Database.update(platform_entity_1.PlatformModel, {
            authenticationEndpoint,
        }, {
            platformUrl: this.platformUrl,
            clientId: this.clientId,
        });
        await this.platformModel.reload();
    }
    /**
     * @description Sets the platform access token endpoint used to authenticate messages to the platform.
     * @param {string} accessTokenEndpoint Platform access token endpoint.
     */
    async setAccessTokenEndpoint(accessTokenEndpoint) {
        await database_1.Database.update(platform_entity_1.PlatformModel, {
            accessTokenEndpoint,
        }, {
            platformUrl: this.platformUrl,
            clientId: this.clientId,
        });
        await this.platformModel.reload();
    }
    /**
     * @description Sets the platform authorization server endpoint used to authenticate messages to the platform.
     * @param {string} authorizationServer Platform authorization server endpoint.
     */
    async setAuthorizationServer(authorizationServer) {
        await database_1.Database.update(platform_entity_1.PlatformModel, {
            authorizationServer,
        }, {
            platformUrl: this.platformUrl,
            clientId: this.clientId,
        });
        await this.platformModel.reload();
    }
    /**
     * @description Gets the platform access token or attempts to generate a new one.
     * @param {String} scopes - String of scopes.
     */
    async getAccessToken(scopes) {
        if (this.scopesSupported) {
            scopes.split(' ').forEach((scope) => {
                if (!this.scopesSupported.some((s) => s == scope)) {
                    throw new Error('SCOPE_UNSUPPORTED');
                }
            });
        }
        const existingToken = await database_1.Database.findOne(access_token_entity_1.AccessTokenModel, {
            where: { platformUrl: this.platformUrl, clientId: this.clientId, scopes },
        });
        let token;
        const expired = existingToken &&
            (Date.now() - existingToken.createdAt.getTime()) / 1000 >
                existingToken.expiresAt;
        if (!existingToken || expired) {
            debug_1.Debug.log(this, 'Valid access_token for ' + this.platformUrl + ' not found');
            debug_1.Debug.log(this, 'Attempting to generate new access_token for ' + this.platformUrl);
            debug_1.Debug.log(this, 'With scopes: ' + scopes);
            token = await auth_1.Auth.getAccessToken(scopes, this);
        }
        else {
            debug_1.Debug.log(this, 'Access_token found');
            token = existingToken.data;
        }
        token.token_type =
            token.token_type.charAt(0).toUpperCase() + token.token_type.slice(1);
        return token;
    }
    /**
     * @description Retrieves the platform information as a JSON object.
     */
    async platformParams() {
        return {
            kid: this.kid,
            platformUrl: this.platformUrl,
            clientId: this.clientId,
            name: this.name,
            authenticationEndpoint: this.authenticationEndpoint,
            accessTokenEndpoint: this.accessTokenEndpoint,
            authToken: this.authToken,
            publicKey: await this.platformPublicKey(),
            active: this.active,
        };
    }
    /**
     * @description Deletes a registered platform.
     */
    async delete() {
        await database_1.Database.delete(key_entity_1.PublicKeyModel, { kid: this.kid });
        await database_1.Database.delete(key_entity_1.PrivateKeyModel, { kid: this.kid });
        await database_1.Database.delete(platform_entity_1.PlatformModel, {
            kid: this.kid,
        });
    }
}
exports.Platform = Platform;
class PlatformApi {
    /**
     * @description Makes an HTTP DELETE request to the platform.
     * @param url - The URL to make the request to
     * @param method - The method to use for the request (e.g., 'GET')
     * @param request - RequestInit properties (e.g., body)
     * @param fullResponse - (Optional) Return full response object
     */
    async request(url, method, request, fullResponse = false) {
        return await axios_1.default
            .request({
            ...request,
            url,
            method,
        })
            .then(async (res) => {
            if (res.status < 200 || res.status > 300) {
                const data = res.data;
                throw {
                    status: res.status,
                    message: data?.error || data?.error_description
                        ? `${data?.error}: ${data?.error_description}`
                        : res.statusText,
                };
            }
            if (res.status == 204) {
                if (fullResponse) {
                    return [undefined, res];
                }
                return;
            }
            if (fullResponse) {
                return [await res.data, res];
            }
            return await res.data;
        })
            .catch((err) => {
            if ('status' in err) {
                throw new Error(`${err.status}: ${err.message}`);
            }
            throw new Error(`500: ${err.toString()}`);
        });
    }
    /**
     * @description Makes an HTTP DELETE request to the platform.
     * @param url - The URL to make the request to
     * @param request - RequestInit properties (e.g., body)
     * @param fullResponse - (Optional) Return full response object
     */
    async get(url, request, fullResponse = false) {
        return await this.request(url, 'GET', request, fullResponse);
    }
    /**
     * @description Makes an HTTP DELETE request to the platform.
     * @param url - The URL to make the request to
     * @param request - RequestInit properties (e.g., body)
     * @param fullResponse - (Optional) Return full response object
     */
    async post(url, request, fullResponse = false) {
        return await this.request(url, 'POST', request, fullResponse);
    }
    /**
     * @description Makes an HTTP PUT request to the platform.
     * @param url - The URL to make the request to
     * @param request - RequestInit properties (e.g., body)
     * @param fullResponse - (Optional) Return full response object
     */
    async put(url, request, fullResponse = false) {
        return await this.request(url, 'PUT', request, fullResponse);
    }
    /**
     * @description Makes an HTTP DELETE request to the platform.
     * @param url - The URL to make the request to
     * @param request - RequestInit properties (e.g., body)
     * @param fullResponse - (Optional) Return full response object
     */
    async patch(url, request, fullResponse = false) {
        return await this.request(url, 'PATCH', request, fullResponse);
    }
    /**
     * @description Makes an HTTP DELETE request to the platform.
     * @param url - The URL to make the request to
     * @param request - RequestInit properties (e.g., body)
     * @param fullResponse - (Optional) Return full response object
     */
    async delete(url, request, fullResponse = false) {
        return await this.request(url, 'DELETE', request, fullResponse);
    }
}
//# sourceMappingURL=platform.js.map