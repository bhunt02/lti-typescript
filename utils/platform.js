"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Platform = void 0;
const platform_entity_1 = require("../entities/platform.entity");
const database_1 = require("./database");
const key_entity_1 = require("../entities/key.entity");
const access_token_entity_1 = require("../entities/access_token.entity");
const auth_1 = require("./auth");
const debug_1 = require("./debug");
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
    async setName(name) {
        await database_1.Database.update(platform_entity_1.PlatformModel, {
            name,
        }, {
            platformUrl: this.platformUrl,
            clientId: this.clientId,
        });
        await this.platformModel.reload();
    }
    async setActive(active) {
        await database_1.Database.update(platform_entity_1.PlatformModel, {
            active,
        }, {
            platformUrl: this.platformUrl,
            clientId: this.clientId,
        });
        await this.platformModel.reload();
    }
    async platformPublicKey() {
        const key = await database_1.Database.findOne(key_entity_1.PublicKeyModel, {
            where: { kid: this.kid },
        });
        return key.data;
    }
    async platformPrivateKey() {
        const key = await database_1.Database.findOne(key_entity_1.PrivateKeyModel, {
            where: { kid: this.kid },
        });
        return key.data;
    }
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
    async setAuthenticationEndpoint(authenticationEndpoint) {
        await database_1.Database.update(platform_entity_1.PlatformModel, {
            authenticationEndpoint,
        }, {
            platformUrl: this.platformUrl,
            clientId: this.clientId,
        });
        await this.platformModel.reload();
    }
    async setAccessTokenEndpoint(accessTokenEndpoint) {
        await database_1.Database.update(platform_entity_1.PlatformModel, {
            accessTokenEndpoint,
        }, {
            platformUrl: this.platformUrl,
            clientId: this.clientId,
        });
        await this.platformModel.reload();
    }
    async setAuthorizationServer(authorizationServer) {
        await database_1.Database.update(platform_entity_1.PlatformModel, {
            authorizationServer,
        }, {
            platformUrl: this.platformUrl,
            clientId: this.clientId,
        });
        await this.platformModel.reload();
    }
    async getAccessToken(scopes) {
        if (this.scopesSupported) {
            scopes.split(' ').forEach((scope) => {
                if (!this.scopesSupported.some(s => s == scope)) {
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
    async request(url, method, request, fullResponse = false) {
        return await fetch(url, {
            ...request,
            method,
        })
            .then(async (res) => {
            if (!res.ok) {
                const json = await res.json().catch(() => undefined);
                throw { status: res.status, message: (json?.error || json?.error_description) ? `${json?.error}: ${json?.error_description}` : res.statusText };
            }
            if (res.status == 204) {
                if (fullResponse) {
                    return [undefined, res];
                }
                return;
            }
            if (fullResponse) {
                return [await res.json(), res];
            }
            return await res.json();
        })
            .catch((err) => {
            if ('status' in err) {
                throw new Error(`${err.status}: ${err.message}`);
            }
            throw new Error(`500: ${err.toString()}`);
        });
    }
    async get(url, request, fullResponse = false) {
        return await this.request(url, 'GET', request, fullResponse);
    }
    async post(url, request, fullResponse = false) {
        return await this.request(url, 'POST', request, fullResponse);
    }
    async put(url, request, fullResponse = false) {
        return await this.request(url, 'PUT', request, fullResponse);
    }
    async patch(url, request, fullResponse = false) {
        return await this.request(url, 'PATCH', request, fullResponse);
    }
    async delete(url, request, fullResponse = false) {
        return await this.request(url, 'DELETE', request, fullResponse);
    }
}
//# sourceMappingURL=platform.js.map