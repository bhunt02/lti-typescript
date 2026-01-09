"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicRegistrationService = void 0;
/* Provider Dynamic Registration Service */
const crypto = require("crypto");
const Url = require("fast-url-parser");
const objects_1 = require("../../utils/objects");
const debug_1 = require("../../utils/debug");
const types_1 = require("../../utils/types");
const axios_1 = require("axios");
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
    // Helper method to build URLs
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
    // Helper method to get the url hostname
    getHostname(url) {
        const pathParts = Url.parse(url);
        let hostname = pathParts.hostname;
        if (pathParts.port)
            hostname += ':' + pathParts.port;
        return hostname;
    }
    /**
     * @description Performs dynamic registration flow.
     * @param {String} openIdConfiguration - OpenID configuration URL. Retrieved from req.query.openid_configuration.
     * @param {String} registrationToken - Registration Token. Retrieved from req.query.registration_token.
     * @param {DynamicRegistrationSecondaryOptions} [options] - Replacements or extensions to default registration options.
     */
    async register(openIdConfiguration, registrationToken, options) {
        if (!openIdConfiguration)
            throw new Error('MISSING_OPENID_CONFIGURATION');
        debug_1.Debug.log(this, 'Starting dynamic registration process');
        // Get Platform registration configurations
        const configuration = await axios_1.default
            .request({
            url: openIdConfiguration,
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + registrationToken,
            },
        })
            .then((response) => {
            return response.data;
        })
            .catch((err) => {
            return err;
        });
        if (configuration instanceof axios_1.AxiosError) {
            throw new Error(`${configuration.status}: ${configuration.response.data}`);
        }
        debug_1.Debug.log(this, 'OpenID Configuration: ', JSON.stringify(configuration));
        debug_1.Debug.log(this, 'Attempting to register Platform with issuer: ', configuration.issuer);
        // Building registration object
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
                'https://purl.imsglobal.org/spec/lti-reg/scope/registration',
                'https://purl.imsglobal.org/spec/lti-reg/scope/registration.readonly',
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
        registration.scope = registration.scope
            .split(' ')
            .filter((v0) => configuration.scopes_supported.some((v1) => v1 == v0))
            .join(' ');
        debug_1.Debug.log(this, `Tool registration request: ${JSON.stringify(registration)}`);
        debug_1.Debug.log(this, 'Sending Tool registration request');
        const registrationResponse = await axios_1.default
            .request({
            method: 'POST',
            url: configuration.registration_endpoint,
            data: registration,
            headers: {
                'Content-Type': 'application/json',
                ...(registrationToken
                    ? { Authorization: 'Bearer ' + registrationToken }
                    : undefined),
            },
        })
            .then((response) => {
            return response.data;
        })
            .catch((err) => {
            return err;
        });
        if (registrationResponse instanceof axios_1.AxiosError) {
            throw new Error(`${registrationResponse.status}: ${registrationResponse.response.data}`);
        }
        // Registering Platform
        const platformName = (configuration['https://purl.imsglobal.org/spec/lti-platform-configuration']
            ? configuration['https://purl.imsglobal.org/spec/lti-platform-configuration'].product_family_code
            : 'Platform') +
            '_DynReg_' +
            crypto.randomBytes(16).toString('hex');
        if (await this.provider.getPlatform(configuration.issuer, registrationResponse.client_id))
            throw new Error('PLATFORM_ALREADY_REGISTERED');
        debug_1.Debug.log(this, 'Registering Platform');
        await this.provider.registerPlatform({
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
            dynamicallyRegistered: true,
            registrationEndpoint: configuration.registration_endpoint,
            scopesSupported: registration.scope.split(' '),
            productFamilyCode: configuration['https://purl.imsglobal.org/spec/lti-platform-configuration']
                ? configuration['https://purl.imsglobal.org/spec/lti-platform-configuration'].product_family_code
                : undefined,
        });
        // Returing message indicating the end of registration flow
        return '<script>(window.opener || window.parent).postMessage({subject:"org.imsglobal.lti.close"}, "*");</script>';
    }
    /**
     * @description Attempts to retrieve an existing dynamic registration.
     * @param {Platform} platform The platform for which to retrieve a dynamic registration.
     * @param {AccessTokenType} accessToken Optionally passed access token to be used in fetching information.
     */
    async getRegistration(platform, accessToken) {
        if (!platform.dynamicallyRegistered) {
            throw new Error('PLATFORM_REGISTRATION_STATIC');
        }
        if (!platform.registrationEndpoint) {
            throw new Error('MISSING_REGISTRATION_ENDPOINT');
        }
        accessToken ?? (accessToken = await platform.getAccessToken('https://purl.imsglobal.org/spec/lti-reg/scope/registration.readonly'));
        return await platform.api.get(platform.registrationEndpoint, {
            headers: {
                Authorization: `${accessToken.token_type} ${accessToken.access_token}`,
            },
        });
    }
    /**
     * @description Performs a dynamic registration update.
     * @param platform The platform to be updated.
     * @param {DynamicRegistrationSecondaryOptions} [options] - Replacements or extensions to default registration options.
     */
    async updateRegistration(platform, options) {
        const accessToken = await platform.getAccessToken('https://purl.imsglobal.org/spec/lti-reg/scope/registration');
        const originalRegistration = await this.getRegistration(platform, accessToken);
        const registration = (0, objects_1.deepMergeObjects)(originalRegistration, {
            application_type: 'web',
            response_types: ['id_token'],
            grant_types: ['client_credentials', 'implicit'],
            initiate_login_uri: this.loginUrl,
            redirect_uris: [...this.redirectUris, this.appUrl],
            client_name: this.name,
            jwks_uri: this.keysetUrl,
            logo_uri: this.logo,
            token_endpoint_auth_method: 'private_key_jwt',
            scope: platform.scopesSupported.join(' '),
            'https://purl.imsglobal.org/spec/lti-tool-configuration': {
                domain: this.hostname,
                description: this.description,
                target_link_uri: this.appUrl,
                custom_parameters: this.customParameters,
            },
        }, options);
        debug_1.Debug.log(this, `Tool registration update: ${JSON.stringify(registration)}`);
        debug_1.Debug.log(this, 'Sending Tool registration update');
        return await platform.api.put(platform.registrationEndpoint, {
            data: registration,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${accessToken.token_type} ${accessToken.access_token}`,
            },
        });
    }
}
exports.DynamicRegistrationService = DynamicRegistrationService;
//# sourceMappingURL=dynamic_registration.js.map