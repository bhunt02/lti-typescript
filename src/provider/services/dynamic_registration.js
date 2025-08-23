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
exports.DynamicRegistrationService = void 0;
var crypto = require("crypto");
var Url = require("fast-url-parser");
var objects_1 = require("../../utils/objects");
var database_1 = require("../../utils/database");
var platform_entity_1 = require("../../entities/platform.entity");
var debug_1 = require("../../utils/debug");
var types_1 = require("../../utils/types");
var DynamicRegistrationService = (function () {
    function DynamicRegistrationService(provider, options, routes) {
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
    DynamicRegistrationService.prototype.buildUrl = function (url, path) {
        if (path === '/')
            return url;
        var pathParts = Url.parse(url);
        var portMatch = pathParts.pathname.match(/:[0-9]*/);
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
    };
    DynamicRegistrationService.prototype.getHostname = function (url) {
        var pathParts = Url.parse(url);
        var hostname = pathParts.hostname;
        if (pathParts.port)
            hostname += ':' + pathParts.port;
        return hostname;
    };
    DynamicRegistrationService.prototype.register = function (openIdConfiguration, registrationToken, options) {
        return __awaiter(this, void 0, void 0, function () {
            var configuration, messages, registration, registrationResponse, platformName, registered;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!openIdConfiguration)
                            throw new Error('MISSING_OPENID_CONFIGURATION');
                        debug_1.Debug.log(this, 'Starting dynamic registration process');
                        return [4, fetch(openIdConfiguration, {
                                method: 'GET',
                            })
                                .then(function (response) {
                                if (!response.ok) {
                                    throw { status: response.status, message: response.statusText };
                                }
                                return response.json();
                            })
                                .catch(function (err) {
                                if ('status' in err) {
                                    throw new Error("".concat(err.status, ": ").concat(err.message));
                                }
                                throw err;
                            })];
                    case 1:
                        configuration = _a.sent();
                        debug_1.Debug.log(this, 'Attempting to register Platform with issuer: ', configuration.issuer);
                        messages = [{ type: 'LtiResourceLinkRequest' }];
                        if (this.useDeepLinking)
                            messages.push({ type: 'LtiDeepLinkingRequest' });
                        registration = (0, objects_1.deepMergeObjects)({
                            application_type: 'web',
                            response_types: ['id_token'],
                            grant_types: ['client_credentials', 'implicit'],
                            initiate_login_uri: this.loginUrl,
                            redirect_uris: __spreadArray(__spreadArray([], this.redirectUris, true), [this.appUrl], false),
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
                                messages: messages,
                            },
                        }, options);
                        debug_1.Debug.log(this, "Tool registration request: ".concat(JSON.stringify(registration)));
                        debug_1.Debug.log(this, 'Sending Tool registration request');
                        return [4, fetch(configuration.registration_endpoint, {
                                method: 'POST',
                                body: JSON.stringify(registration),
                                headers: __assign({ 'Content-Type': 'application/json' }, (registrationToken
                                    ? { Authorization: 'Bearer ' + registrationToken }
                                    : undefined)),
                            })
                                .then(function (response) {
                                if (!response.ok) {
                                    throw { status: response.status, message: response.statusText };
                                }
                                return response.json();
                            })
                                .catch(function (err) {
                                if ('status' in err) {
                                    throw new Error("".concat(err.status, ": ").concat(err.message));
                                }
                                throw err;
                            })];
                    case 2:
                        registrationResponse = _a.sent();
                        platformName = (configuration['https://purl.imsglobal.org/spec/lti-platform-configuration']
                            ? configuration['https://purl.imsglobal.org/spec/lti-platform-configuration'].product_family_code
                            : 'Platform') +
                            '_DynReg_' +
                            crypto.randomBytes(16).toString('hex');
                        return [4, this.provider.getPlatform(configuration.issuer, registrationResponse.client_id)];
                    case 3:
                        if (_a.sent())
                            throw new Error('PLATFORM_ALREADY_REGISTERED');
                        debug_1.Debug.log(this, 'Registering Platform');
                        return [4, this.provider.registerPlatform({
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
                            })];
                    case 4:
                        registered = _a.sent();
                        return [4, database_1.Database.update(platform_entity_1.PlatformModel, { active: this.autoActivate }, { kid: registered.kid })];
                    case 5:
                        _a.sent();
                        return [2, '<script>(window.opener || window.parent).postMessage({subject:"org.imsglobal.lti.close"}, "*");</script>'];
                }
            });
        });
    };
    return DynamicRegistrationService;
}());
exports.DynamicRegistrationService = DynamicRegistrationService;
