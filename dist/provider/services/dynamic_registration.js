"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicRegistrationService = void 0;
const crypto = require("crypto");
const Url = require("fast-url-parser");
const objects_1 = require("../../utils/objects");
const database_1 = require("../../utils/database");
const platform_entity_1 = require("../../entities/platform.entity");
const debug_1 = require("../../utils/debug");
const types_1 = require("../../utils/types");
class DynamicRegistrationService {
    constructor(provider, options, routes) {
        this.provider = provider;
        this.name = options.name;
        this.redirectUris = options.redirectUris || [];
        this.customParameters = options.customParameters || {};
        this.autoActivate = options.autoActivate;
        this.useDeepLinking =
            options.useDeepLinking === undefined ? true : options.useDeepLinking;
        this.logo = options.logo;
        this.description = options.description;
        this.hostname = this.getHostname(options.url);
        this.appUrl = this.buildUrl(options.url, routes.appRoute);
        this.loginUrl = this.buildUrl(options.url, routes.loginRoute);
        this.keysetUrl = this.buildUrl(options.url, routes.keySetRoute);
    }
    buildUrl(url, path) {
        if (path === '/')
            return url;
        const pathParts = Url.parse(url);
        const portMatch = pathParts.pathname.match(/:[0-9]*/);
        if (portMatch) {
            pathParts.port = portMatch[0].split(':')[1];
            pathParts.pathname = pathParts.pathname.split(portMatch[0]).join('');
        }
        return Url.format({
            protocol: pathParts.protocol,
            hostname: pathParts.hostname,
            pathname: (pathParts.pathname + path).replace('//', '/'),
            port: pathParts.port,
            auth: pathParts.auth,
            hash: pathParts.hash,
            search: pathParts.search,
        });
    }
    getHostname(url) {
        const pathParts = Url.parse(url);
        let hostname = pathParts.hostname;
        if (pathParts.port)
            hostname += ':' + pathParts.port;
        return hostname;
    }
    async register(openIdConfiguration, registrationToken, options) {
        if (!openIdConfiguration)
            throw new Error('MISSING_OPENID_CONFIGURATION');
        debug_1.Debug.log(this, 'Starting dynamic registration process');
        const configuration = await fetch(openIdConfiguration, {
            method: 'GET',
        })
            .then((response) => {
            if (!response.ok) {
                throw { status: response.status, message: response.statusText };
            }
            return response.json();
        })
            .catch((err) => {
            if ('status' in err) {
                throw new Error(`${err.status}: ${err.message}`);
            }
            throw err;
        });
        debug_1.Debug.log(this, 'Attempting to register Platform with issuer: ', configuration.issuer);
        const messages = [{ type: 'LtiResourceLinkRequest' }];
        if (this.useDeepLinking)
            messages.push({ type: 'LtiDeepLinkingRequest' });
        const registration = (0, objects_1.deepMergeObjects)({
            application_type: 'web',
            response_types: ['id_token'],
            grant_types: ['client_credentials', 'implicit'],
            initiate_login_uri: this.loginUrl,
            redirect_uris: [...this.redirectUris, this.appUrl],
            client_name: this.name,
            jwks_uri: this.keysetUrl,
            logo_uri: this.logo,
            token_endpoint_auth_method: 'private_key_jwt',
            scope: [
                'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly',
                'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
                'https://purl.imsglobal.org/spec/lti-ags/scope/score',
                'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly',
                'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly',
            ].join(' '),
            'https://purl.imsglobal.org/spec/lti-tool-configuration': {
                domain: this.hostname,
                description: this.description,
                target_link_uri: this.appUrl,
                custom_parameters: this.customParameters,
                claims: configuration.claims_supported,
                messages,
            },
        }, options);
        debug_1.Debug.log(this, `Tool registration request: ${JSON.stringify(registration)}`);
        debug_1.Debug.log(this, 'Sending Tool registration request');
        const registrationResponse = await fetch(configuration.registration_endpoint, {
            method: 'POST',
            body: JSON.stringify(registration),
            headers: {
                'Content-Type': 'application/json',
                ...(registrationToken
                    ? { Authorization: 'Bearer ' + registrationToken }
                    : undefined),
            },
        })
            .then((response) => {
            if (!response.ok) {
                throw { status: response.status, message: response.statusText };
            }
            return response.json();
        })
            .catch((err) => {
            if ('status' in err) {
                throw new Error(`${err.status}: ${err.message}`);
            }
            throw err;
        });
        const platformName = (configuration['https://purl.imsglobal.org/spec/lti-platform-configuration']
            ? configuration['https://purl.imsglobal.org/spec/lti-platform-configuration'].product_family_code
            : 'Platform') +
            '_DynReg_' +
            crypto.randomBytes(16).toString('hex');
        if (await this.provider.getPlatform(configuration.issuer, registrationResponse.client_id))
            throw new Error('PLATFORM_ALREADY_REGISTERED');
        debug_1.Debug.log(this, 'Registering Platform');
        const registered = await this.provider.registerPlatform({
            platformUrl: configuration.issuer,
            name: platformName,
            clientId: registrationResponse.client_id,
            authenticationEndpoint: configuration.authorization_endpoint,
            accessTokenEndpoint: configuration.token_endpoint,
            authorizationServer: configuration.authorization_server,
            authToken: {
                method: types_1.AuthTokenMethodEnum.JWK_SET,
                key: configuration.jwks_uri,
            },
            active: this.autoActivate,
        });
        await database_1.Database.update(platform_entity_1.PlatformModel, { active: this.autoActivate }, { kid: registered.kid });
        return '<script>(window.opener || window.parent).postMessage({subject:"org.imsglobal.lti.close"}, "*");</script>';
    }
}
exports.DynamicRegistrationService = DynamicRegistrationService;
//# sourceMappingURL=dynamic_registration.js.map