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
exports.Provider = void 0;
exports.register = register;
var server_1 = require("../utils/server");
var platform_1 = require("../utils/platform");
var auth_1 = require("../utils/auth");
var database_1 = require("../utils/database");
var keyset_1 = require("../utils/keyset");
var grade_1 = require("./services/grade");
var deep_linking_1 = require("./services/deep_linking");
var names_and_roles_1 = require("./services/names_and_roles");
var dynamic_registration_1 = require("./services/dynamic_registration");
var Url = require("fast-url-parser");
var jwt = require("jsonwebtoken");
var crypto = require("crypto");
var debug_1 = require("../utils/debug");
var state_entity_1 = require("../entities/state.entity");
var context_token_entity_1 = require("../entities/context_token.entity");
var id_token_entity_1 = require("../entities/id_token.entity");
var platform_entity_1 = require("../entities/platform.entity");
var key_entity_1 = require("../entities/key.entity");
function register(encryptionKey, databaseOptions, options) {
    return __awaiter(this, void 0, void 0, function () {
        var provider;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    provider = new Provider();
                    return [4, provider.setup(encryptionKey, databaseOptions, options)];
                case 1:
                    _a.sent();
                    return [2, provider];
            }
        });
    });
}
var Provider = (function () {
    function Provider() {
        var _this = this;
        this._loginRoute = '/login';
        this._appRoute = '/';
        this._keySetRoute = '/keys';
        this._dynRegRoute = '/register';
        this.whitelistedRoutes = [];
        this.devMode = false;
        this.tokenMaxAge = 10;
        this.cookieOptions = {
            secure: false,
            httpOnly: true,
            signed: true,
            sameSite: 'none',
            domain: undefined,
        };
        this.isSetup = false;
        this.connectCallback = function (_token, _req, _res, next) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, next()];
            });
        }); };
        this.deepLinkingCallback = function (_token, _req, _res, next) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, next()];
            });
        }); };
        this.dynamicRegistrationCallback = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var message, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!req.query.openid_configuration)
                            return [2, res.status(400).send({
                                    status: 400,
                                    error: 'Bad Request',
                                    message: 'Missing parameter: "openid_configuration".',
                                })];
                        return [4, this.DynamicRegistration.register(req.query.openid_configuration, req.query.registration_token)];
                    case 1:
                        message = _a.sent();
                        res.setHeader('Content-type', 'text/html');
                        res.send(message);
                        return [3, 3];
                    case 2:
                        err_1 = _a.sent();
                        debug_1.Debug.log(this, err_1);
                        if (err_1.message === 'PLATFORM_ALREADY_REGISTERED')
                            return [2, res.status(403).send({
                                    status: 403,
                                    error: 'Forbidden',
                                    message: 'Platform already registered.',
                                })];
                        return [2, res.status(500).send({
                                status: 500,
                                error: 'Internal Server Error',
                                message: err_1.message,
                            })];
                    case 3: return [2];
                }
            });
        }); };
        this.sessionTimeoutCallback = function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, res.status(401).send(res.locals.err)];
            });
        }); };
        this.invalidTokenCallback = function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, res.status(401).send(res.locals.err)];
            });
        }); };
        this.unregisteredPlatformCallback = function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, res.status(400).send({
                        status: 400,
                        error: 'Bad Request',
                        message: 'UNREGISTERED_PLATFORM',
                    })];
            });
        }); };
        this.inactivePlatformCallback = function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, res.status(401).send({
                        status: 401,
                        error: 'Unauthorized',
                        message: 'PLATFORM_NOT_ACTIVATED',
                    })];
            });
        }); };
    }
    Object.defineProperty(Provider.prototype, "loginRoute", {
        get: function () {
            return this._loginRoute;
        },
        set: function (route) {
            this._loginRoute = route;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Provider.prototype, "appRoute", {
        get: function () {
            return this._appRoute;
        },
        set: function (route) {
            this._appRoute = route;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Provider.prototype, "keySetRoute", {
        get: function () {
            return this._keySetRoute;
        },
        set: function (route) {
            this._keySetRoute = route;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Provider.prototype, "dynRegRoute", {
        get: function () {
            return this._dynRegRoute;
        },
        set: function (route) {
            this._dynRegRoute = route;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Provider.prototype, "whitelist", {
        get: function () {
            return this.whitelistedRoutes;
        },
        set: function (routes) {
            var formattedRoutes = [];
            for (var _i = 0, routes_1 = routes; _i < routes_1.length; _i++) {
                var route = routes_1[_i];
                var isObject = typeof route === 'object';
                if (isObject) {
                    if (!route.route || !route.method)
                        throw new Error('WRONG_FORMAT. Details: Expects string ("/route") or object ({ route: "/route", method: "POST" })');
                    formattedRoutes.push({
                        route: route.route,
                        method: route.method.toUpperCase(),
                    });
                }
                else {
                    formattedRoutes.push({ route: route, method: 'ALL' });
                }
            }
            this.whitelistedRoutes = __spreadArray([], formattedRoutes, true);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Provider.prototype, "app", {
        get: function () {
            return this._app;
        },
        set: function (app) {
            this._app = app;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Provider.prototype, "DynamicRegistration", {
        get: function () {
            return this._DynamicRegistration;
        },
        set: function (dynamicRegistration) {
            this._DynamicRegistration = dynamicRegistration;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Provider.prototype, "GradeService", {
        get: function () {
            return this._GradeService;
        },
        set: function (gradeService) {
            this._GradeService = gradeService;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Provider.prototype, "NamesAndRolesService", {
        get: function () {
            return this._NamesAndRolesService;
        },
        set: function (namesAndRolesService) {
            this._NamesAndRolesService = namesAndRolesService;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Provider.prototype, "DeepLinkingService", {
        get: function () {
            return this._DeepLinkingService;
        },
        set: function (deepLinkingService) {
            this._DeepLinkingService = deepLinkingService;
        },
        enumerable: false,
        configurable: true
    });
    Provider.prototype.getServer = function () {
        return this.server.server;
    };
    Provider.prototype.keyset = function (_req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var keyset, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, keyset_1.Keyset.build()];
                    case 1:
                        keyset = _a.sent();
                        return [2, res.status(200).send(keyset)];
                    case 2:
                        err_2 = _a.sent();
                        debug_1.Debug.log(this, err_2);
                        return [2, res.status(500).send({
                                status: 500,
                                error: 'Internal Server Error',
                                message: err_2.message,
                            })];
                    case 3: return [2];
                }
            });
        });
    };
    Provider.prototype.clearStateCookie = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var state, savedState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        state = req.body.state;
                        if (!state) return [3, 3];
                        debug_1.Debug.log(this, 'Deleting state cookie and Database entry');
                        return [4, database_1.Database.findOne(state_entity_1.StateModel, {
                                where: { state: state },
                            })];
                    case 1:
                        savedState = _a.sent();
                        res.clearCookie('state' + state, this.cookieOptions);
                        if (!savedState) return [3, 3];
                        return [4, database_1.Database.delete(state_entity_1.StateModel, { state: state })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2];
                }
            });
        });
    };
    Provider.prototype.setup = function (encryptionKey, databaseOptions, options) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionValidator;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isSetup)
                            throw new Error('PROVIDER_ALREADY_SETUP');
                        if (options &&
                            options.https &&
                            (!options.ssl || !options.ssl.key || !options.ssl.cert))
                            throw new Error('MISSING_SSL_KEY_CERTIFICATE');
                        if (!encryptionKey)
                            throw new Error('MISSING_ENCRYPTION_KEY');
                        if (options &&
                            options.dynReg &&
                            (!options.dynReg.url || !options.dynReg.name)) {
                            throw new Error('MISSING_DYNREG_CONFIGURATION');
                        }
                        debug_1.Debug.init(options.debug);
                        return [4, database_1.Database.initializeDatabase(databaseOptions, encryptionKey)];
                    case 1:
                        _a.sent();
                        if (options && (options.keySetRoute || options.appUrl))
                            this.appRoute = options.appRoute || options.appUrl;
                        if (options && (options.loginRoute || options.loginUrl))
                            this.loginRoute = options.loginRoute || options.loginUrl;
                        if (options && (options.keySetRoute || options.keySetUrl))
                            this.keySetRoute = options.keySetRoute || options.keySetUrl;
                        if (options && (options.dynRegRoute || options.dynRegUrl))
                            this.dynRegRoute = options.dynRegRoute || options.dynRegUrl;
                        if (options && options.devMode === true)
                            this.devMode = true;
                        if (options && options.tokenMaxAge !== undefined)
                            this.tokenMaxAge = options.tokenMaxAge;
                        if (options && options.cookies) {
                            if (options.cookies.secure === true)
                                this.cookieOptions.secure = true;
                            if (options.cookies.sameSite)
                                this.cookieOptions.sameSite = options.cookies.sameSite;
                            if (options.cookies.domain)
                                this.cookieOptions.domain = options.cookies.domain;
                        }
                        this.encryptionKey = encryptionKey;
                        this.server = new server_1.Server(this.encryptionKey, options === null || options === void 0 ? void 0 : options.https, options === null || options === void 0 ? void 0 : options.cors, options === null || options === void 0 ? void 0 : options.ssl, options === null || options === void 0 ? void 0 : options.serverAddon);
                        this.app = this.server.app;
                        this.GradeService = new grade_1.GradeService(this);
                        this.DeepLinkingService = new deep_linking_1.DeepLinkingService(this);
                        this.NamesAndRolesService = new names_and_roles_1.NamesAndRolesService(this);
                        if (options && options.dynReg) {
                            this.DynamicRegistration = new dynamic_registration_1.DynamicRegistrationService(this, options.dynReg, {
                                appRoute: this.appRoute,
                                loginRoute: this.loginRoute,
                                keySetRoute: this.keySetRoute,
                            });
                        }
                        if (options && options.staticPath)
                            this.server.setStaticPath(options.staticPath);
                        sessionValidator = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
                            var ltik, cookies, idToken, state, validationCookie, validationParameters, valid, savedState, courseId, resourceId, clientId_1, deploymentId_1, additionalContextProperties, hashOfAdditionalContextProperties, contextId_1, platformCode_1, platformToken, contextToken, newLtikObj, newLtik, query, _i, _a, _b, key, value, urlSearchParams, validLtik, platformUrl, platformCode, clientId, deploymentId, contextId, user, cookieUser, idTokenRes, idToken, contextToken, err_3;
                            var _c, _d;
                            return __generator(this, function (_e) {
                                switch (_e.label) {
                                    case 0:
                                        debug_1.Debug.log(this, 'Receiving request at path: ' + req.baseUrl + req.path);
                                        if (req.path === this.loginRoute ||
                                            req.path === this.keySetRoute ||
                                            req.path === this.dynRegRoute) {
                                            return [2, next()];
                                        }
                                        debug_1.Debug.log(this, 'Path does not match reserved endpoints');
                                        _e.label = 1;
                                    case 1:
                                        _e.trys.push([1, 15, , 17]);
                                        ltik = req['token'];
                                        cookies = req.signedCookies;
                                        debug_1.Debug.log(this, "Cookies received: ".concat(JSON.stringify(cookies)));
                                        if (!!ltik) return [3, 10];
                                        idToken = (_c = req.body.id_token) !== null && _c !== void 0 ? _c : req.query.id_token;
                                        if (!idToken) return [3, 8];
                                        debug_1.Debug.log(this, 'Received idtoken for validation');
                                        state = (_d = req.body.state) !== null && _d !== void 0 ? _d : req.params.state;
                                        debug_1.Debug.log(this, 'Response state: ' + state);
                                        validationCookie = cookies['state' + state];
                                        validationParameters = {
                                            iss: validationCookie,
                                            maxAge: this.tokenMaxAge,
                                        };
                                        return [4, auth_1.Auth.validateToken(this, idToken, this.devMode, validationParameters)];
                                    case 2:
                                        valid = _e.sent();
                                        return [4, database_1.Database.findOne(state_entity_1.StateModel, {
                                                where: { state: state },
                                            })];
                                    case 3:
                                        savedState = _e.sent();
                                        res.clearCookie('state' + state, this.cookieOptions);
                                        if (!savedState) return [3, 5];
                                        return [4, database_1.Database.delete(state_entity_1.StateModel, { state: state })];
                                    case 4:
                                        _e.sent();
                                        _e.label = 5;
                                    case 5:
                                        debug_1.Debug.log(this, 'Successfully validated token!');
                                        courseId = valid['https://purl.imsglobal.org/spec/lti/claim/context']
                                            ? valid['https://purl.imsglobal.org/spec/lti/claim/context'].id
                                            : 'NF';
                                        resourceId = valid['https://purl.imsglobal.org/spec/lti/claim/resource_link']
                                            ? valid['https://purl.imsglobal.org/spec/lti/claim/resource_link']
                                                .id
                                            : 'NF';
                                        clientId_1 = valid.clientId;
                                        deploymentId_1 = valid['https://purl.imsglobal.org/spec/lti/claim/deployment_id'];
                                        additionalContextProperties = {
                                            path: req.path,
                                            roles: valid['https://purl.imsglobal.org/spec/lti/claim/roles'],
                                            targetLinkUri: valid['https://purl.imsglobal.org/spec/lti/claim/target_link_uri'],
                                            custom: valid['https://purl.imsglobal.org/spec/lti/claim/custom'],
                                            launchPresentation: valid['https://purl.imsglobal.org/spec/lti/claim/launch_presentation'],
                                            endpoint: valid['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'],
                                            namesRoles: valid['https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice'],
                                        };
                                        hashOfAdditionalContextProperties = crypto
                                            .createHash('sha256')
                                            .update(JSON.stringify(additionalContextProperties))
                                            .digest('hex');
                                        contextId_1 = encodeURIComponent(valid.iss +
                                            clientId_1 +
                                            deploymentId_1 +
                                            courseId +
                                            '_' +
                                            resourceId +
                                            '_' +
                                            hashOfAdditionalContextProperties);
                                        platformCode_1 = encodeURIComponent('lti' +
                                            Buffer.from(valid.iss + clientId_1 + deploymentId_1).toString('base64'));
                                        platformToken = {
                                            iss: valid.iss,
                                            user: valid.sub,
                                            userInfo: {
                                                given_name: valid.given_name,
                                                family_name: valid.family_name,
                                                name: valid.name,
                                                email: valid.email,
                                            },
                                            platformInfo: valid['https://purl.imsglobal.org/spec/lti/claim/tool_platform'],
                                            clientId: clientId_1,
                                            platformId: valid.platformId,
                                            deploymentId: deploymentId_1,
                                        };
                                        contextToken = __assign({ contextId: contextId_1, user: valid.sub, context: valid['https://purl.imsglobal.org/spec/lti/claim/context'], resource: valid['https://purl.imsglobal.org/spec/lti/claim/resource_link'], messageType: valid['https://purl.imsglobal.org/spec/lti/claim/message_type'], version: valid['https://purl.imsglobal.org/spec/lti/claim/version'], deepLinkingSettings: valid['https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'], lis: valid['https://purl.imsglobal.org/spec/lti/claim/lis'] }, additionalContextProperties);
                                        return [4, database_1.Database.save(id_token_entity_1.IdTokenModel, platformToken)];
                                    case 6:
                                        _e.sent();
                                        return [4, database_1.Database.save(context_token_entity_1.ContextTokenModel, contextToken)];
                                    case 7:
                                        _e.sent();
                                        res.cookie(platformCode_1, valid.sub, this.cookieOptions);
                                        debug_1.Debug.log(this, 'Generating ltik');
                                        newLtikObj = {
                                            platformUrl: valid.iss,
                                            clientId: clientId_1,
                                            deploymentId: deploymentId_1,
                                            platformCode: platformCode_1,
                                            contextId: contextId_1,
                                            user: valid.sub,
                                            s: state,
                                        };
                                        newLtik = jwt.sign(newLtikObj, this.encryptionKey);
                                        query = new URLSearchParams(req.query);
                                        if (savedState) {
                                            for (_i = 0, _a = Object.entries(savedState[0].query); _i < _a.length; _i++) {
                                                _b = _a[_i], key = _b[0], value = _b[1];
                                                query.append(key, String(value));
                                            }
                                        }
                                        query.append('ltik', newLtik);
                                        urlSearchParams = query.toString();
                                        debug_1.Debug.log(this, 'Redirecting to endpoint with ltik');
                                        res.clearCookie('state' + state);
                                        return [2, res.redirect(req.baseUrl + req.path + '?' + urlSearchParams)];
                                    case 8: return [4, this.clearStateCookie(req, res)];
                                    case 9:
                                        _e.sent();
                                        if (this.whitelistedRoutes.find(function (r) {
                                            return ((r.route instanceof RegExp && r.route.test(req.path)) ||
                                                r.route === req.path) &&
                                                (r.method === 'ALL' ||
                                                    r.method.toUpperCase() === req.method.toUpperCase());
                                        })) {
                                            debug_1.Debug.log(this, 'Accessing as whitelisted route');
                                            return [2, next()];
                                        }
                                        debug_1.Debug.log(this, 'No ltik found');
                                        debug_1.Debug.log(this, 'Request body: ', JSON.stringify(req.body));
                                        debug_1.Debug.log(this, 'Passing request to invalid token handler');
                                        res.locals.err = {
                                            status: 401,
                                            error: 'Unauthorized',
                                            message: 'NO_LTIK_OR_IDTOKEN_FOUND',
                                            details: {
                                                bodyReceived: req.body,
                                            },
                                        };
                                        return [2, this.invalidTokenCallback(req, res, next)];
                                    case 10:
                                        debug_1.Debug.log(this, 'Ltik found');
                                        validLtik = void 0;
                                        try {
                                            validLtik = jwt.verify(ltik, this.encryptionKey);
                                        }
                                        catch (err) {
                                            if (this.whitelistedRoutes.find(function (r) {
                                                if ((r.route instanceof RegExp && r.route.test(req.path)) ||
                                                    r.route === req.path)
                                                    return (r.method === 'ALL' || r.method === req.method.toUpperCase());
                                                return false;
                                            })) {
                                                debug_1.Debug.log(this, 'Accessing as whitelisted route');
                                                return [2, next()];
                                            }
                                            throw err;
                                        }
                                        debug_1.Debug.log(this, 'Ltik successfully verified');
                                        platformUrl = validLtik.platformUrl;
                                        platformCode = validLtik.platformCode;
                                        clientId = validLtik.clientId;
                                        deploymentId = validLtik.deploymentId;
                                        contextId = validLtik.contextId;
                                        user = validLtik.user;
                                        debug_1.Debug.log(this, "Attempting to retrieve matching session cookie (".concat(platformCode, ")"));
                                        cookieUser = cookies[platformCode];
                                        if (!cookieUser) {
                                            if (!this.devMode)
                                                user = undefined;
                                            else {
                                                debug_1.Debug.log(this, 'Dev Mode enabled: Missing session cookies will be ignored');
                                            }
                                        }
                                        else if (user.toString() !== cookieUser.toString()) {
                                            user = undefined;
                                        }
                                        if (!user) return [3, 13];
                                        debug_1.Debug.log(this, 'Valid session found');
                                        return [4, database_1.Database.findOne(id_token_entity_1.IdTokenModel, {
                                                where: { iss: platformUrl, clientId: clientId, deploymentId: deploymentId, user: user },
                                            })];
                                    case 11:
                                        idTokenRes = _e.sent();
                                        if (!idTokenRes)
                                            throw new Error('IDTOKEN_NOT_FOUND_DB');
                                        idToken = JSON.parse(JSON.stringify(idTokenRes));
                                        return [4, database_1.Database.findOne(context_token_entity_1.ContextTokenModel, {
                                                where: { contextId: contextId, user: user },
                                            })];
                                    case 12:
                                        contextToken = _e.sent();
                                        if (!contextToken)
                                            throw new Error('CONTEXTTOKEN_NOT_FOUND_DB');
                                        idToken.platformContext = JSON.parse(JSON.stringify(contextToken));
                                        res.locals.context = idToken.platformContext;
                                        res.locals.token = idToken;
                                        res.locals.ltik = ltik;
                                        debug_1.Debug.log(this, 'Passing request to next handler');
                                        return [2, next()];
                                    case 13:
                                        debug_1.Debug.log(this, 'No session cookie found');
                                        debug_1.Debug.log(this, 'Request body: ', JSON.stringify(req.body));
                                        debug_1.Debug.log(this, 'Passing request to session timeout handler');
                                        res.locals.err = {
                                            status: 401,
                                            error: 'Unauthorized',
                                            message: 'Session not found.',
                                        };
                                        return [2, this.sessionTimeoutCallback(req, res, next)];
                                    case 14: return [3, 17];
                                    case 15:
                                        err_3 = _e.sent();
                                        return [4, this.clearStateCookie(req, res)];
                                    case 16:
                                        _e.sent();
                                        debug_1.Debug.log(this, err_3);
                                        debug_1.Debug.log(this, 'Passing request to invalid token handler');
                                        res.locals.err = {
                                            status: 401,
                                            error: 'Unauthorized',
                                            message: err_3.message,
                                            details: {
                                                description: 'Error validating ltik or IdToken',
                                            },
                                        };
                                        return [2, this.invalidTokenCallback(req, res, next)];
                                    case 17: return [2];
                                }
                            });
                        }); };
                        this.app.use(sessionValidator);
                        this.app.all(this.loginRoute, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                            var params, iss, clientId, platform, state, rawQueries, queries, _i, rawQueries_1, _a, key, value, cookieOptions, query, err_4;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        params = __assign(__assign({}, req.query), req.body);
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 14, , 15]);
                                        if (!params.iss || !params.login_hint || !params.target_link_uri)
                                            return [2, res.status(400).send({
                                                    status: 400,
                                                    error: 'Bad Request',
                                                    message: 'MISSING_LOGIN_PARAMETERS',
                                                })];
                                        iss = params.iss;
                                        clientId = params.client_id;
                                        debug_1.Debug.log(this, 'Receiving a login request from: ' + iss + ', clientId: ' + clientId);
                                        platform = void 0;
                                        if (!clientId) return [3, 3];
                                        return [4, this.getPlatform(iss, clientId)];
                                    case 2:
                                        platform = _b.sent();
                                        return [3, 5];
                                    case 3: return [4, this.getPlatforms(iss)];
                                    case 4:
                                        platform = (_b.sent())[0];
                                        _b.label = 5;
                                    case 5:
                                        if (!platform) return [3, 12];
                                        if (!platform.active)
                                            return [2, this.inactivePlatformCallback(req, res)];
                                        debug_1.Debug.log(this, 'Redirecting to platform authentication endpoint');
                                        state = encodeURIComponent(crypto.randomBytes(25).toString('hex'));
                                        debug_1.Debug.log(this, 'Target Link URI: ', params.target_link_uri);
                                        if (!params.target_link_uri.includes('?')) return [3, 10];
                                        rawQueries = new URLSearchParams('?' + params.target_link_uri.split('?')[1]);
                                        _b.label = 6;
                                    case 6: return [4, database_1.Database.findOne(state_entity_1.StateModel, { where: { state: state } })];
                                    case 7:
                                        if (!_b.sent()) return [3, 8];
                                        state = encodeURIComponent(crypto.randomBytes(25).toString('hex'));
                                        debug_1.Debug.log(this, 'Generated state: ', state);
                                        return [3, 6];
                                    case 8:
                                        queries = {};
                                        for (_i = 0, rawQueries_1 = rawQueries; _i < rawQueries_1.length; _i++) {
                                            _a = rawQueries_1[_i], key = _a[0], value = _a[1];
                                            queries[key] = value;
                                        }
                                        params.target_link_uri = params.target_link_uri.split('?')[0];
                                        debug_1.Debug.log(this, 'Query parameters found: ', queries);
                                        debug_1.Debug.log(this, 'Final Redirect URI: ', params.target_link_uri);
                                        return [4, database_1.Database.save(state_entity_1.StateModel, {
                                                state: state,
                                                query: queries,
                                            })];
                                    case 9:
                                        _b.sent();
                                        _b.label = 10;
                                    case 10:
                                        cookieOptions = JSON.parse(JSON.stringify(this.cookieOptions));
                                        cookieOptions.maxAge = 60 * 1000;
                                        res.cookie('state' + state, iss, cookieOptions);
                                        return [4, this.ltiAdvantageLogin(params, platform, state)];
                                    case 11:
                                        query = _b.sent();
                                        debug_1.Debug.log(this, "Login request: ".concat(platform.authenticationEndpoint, ", ").concat(JSON.stringify(query)));
                                        res.redirect(Url.format({
                                            pathname: platform.authenticationEndpoint,
                                            query: query,
                                        }));
                                        return [3, 13];
                                    case 12:
                                        debug_1.Debug.log(this, 'Unregistered platform attempting connection: ' +
                                            iss +
                                            ', clientId: ' +
                                            clientId);
                                        return [2, this.unregisteredPlatformCallback(req, res)];
                                    case 13: return [3, 15];
                                    case 14:
                                        err_4 = _b.sent();
                                        debug_1.Debug.log(this, err_4);
                                        return [2, res.status(500).send({
                                                status: 500,
                                                error: 'Internal Server Error',
                                                message: err_4.message,
                                            })];
                                    case 15: return [2];
                                }
                            });
                        }); });
                        this.app.get(this.keySetRoute, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2, this.keyset(req, res)];
                            });
                        }); });
                        this.app.all(this.dynRegRoute, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (this.DynamicRegistration)
                                    return [2, this.dynamicRegistrationCallback(req, res, next)];
                                return [2, res.status(403).send({
                                        status: 403,
                                        error: 'Forbidden',
                                        message: 'Dynamic registration is disabled.',
                                    })];
                            });
                        }); });
                        this.app.all(this.appRoute, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (res.locals.context &&
                                    res.locals.context.messageType === 'LtiDeepLinkingRequest') {
                                    return [2, this.deepLinkingCallback(res.locals.token, req, res, next)];
                                }
                                return [2, this.connectCallback(res.locals.token, req, res, next)];
                            });
                        }); });
                        this.isSetup = true;
                        return [2, this];
                }
            });
        });
    };
    Provider.prototype.deploy = function () {
        return __awaiter(this, arguments, void 0, function (options) {
            var message, err_5;
            var _this = this;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Object.keys(options).forEach(function (k) {
                            if (options[k] === null || options[k] === undefined) {
                                delete options[k];
                            }
                        });
                        options = __assign({ port: 3000, silent: false, serverless: false }, options);
                        if (!this.setup)
                            throw new Error('PROVIDER_NOT_SETUP');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 7]);
                        if (!(options && options.serverless)) return [3, 2];
                        if (!options.silent) {
                            console.log('LTI-TYPESCRIPT started in serverless mode...');
                        }
                        return [3, 4];
                    case 2: return [4, this.server.listen(options.port)];
                    case 3:
                        _a.sent();
                        debug_1.Debug.log(this, 'Ltijs started listening on port: ', options.port);
                        message = 'LTI Provider is listening on port ' +
                            options.port +
                            '!\n\n LTI provider config: \n >App Route: ' +
                            this.appRoute +
                            '\n >Initiate Login Route: ' +
                            this.loginRoute +
                            '\n >Keyset Route: ' +
                            this.keySetRoute +
                            '\n >Dynamic Registration Route: ' +
                            this.dynRegRoute;
                        if (!options.silent) {
                            console.log("\n    __  __________   ________  ______  ___________ __________  ________  ______\n   / / /_  __/  _/  /_  __/\\ \\/ / __ \\/ ____/ ___// ____/ __ \\/  _/ __ \\/_  __/\n  / /   / /  / /_____/ /    \\  / /_/ / __/  \\__ \\/ /   / /_/ // // /_/ / / /   \n / /___/ / _/ /_____/ /     / / ____/ /___ ___/ / /___/ _, _// // ____/ / /    \n/_____/_/ /___/    /_/     /_/_/   /_____//____/\\____/_/ |_/___/_/     /_/                                                                 \n\n          ", message);
                        }
                        _a.label = 4;
                    case 4:
                        if (this.devMode && !options.silent)
                            console.log('\nStarting in Dev Mode, state validation and session cookies will not be required. THIS SHOULD NOT BE USED IN A PRODUCTION ENVIRONMENT!');
                        process.on('SIGINT', function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, this.close(options.silent)];
                                    case 1:
                                        _a.sent();
                                        process.exit();
                                        return [2];
                                }
                            });
                        }); });
                        return [2, true];
                    case 5:
                        err_5 = _a.sent();
                        console.log('Error during deployment: ', err_5);
                        return [4, this.close(options.silent)];
                    case 6:
                        _a.sent();
                        process.exit();
                        return [3, 7];
                    case 7: return [2];
                }
            });
        });
    };
    Provider.prototype.close = function () {
        return __awaiter(this, arguments, void 0, function (silent) {
            if (silent === void 0) { silent = true; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!silent)
                            console.log('\nClosing server...');
                        this.server.close();
                        if (!silent)
                            console.log('Closing connection to the database...');
                        return [4, database_1.Database.close()];
                    case 1:
                        _a.sent();
                        if (!silent)
                            console.log('Shutdown complete.');
                        return [2];
                }
            });
        });
    };
    Provider.prototype.onConnect = function (connectCallback) {
        if (connectCallback) {
            this.connectCallback = connectCallback;
            return;
        }
        throw new Error('MISSING_CALLBACK');
    };
    Provider.prototype.onDeepLinking = function (deepLinkingCallback) {
        if (deepLinkingCallback) {
            this.deepLinkingCallback = deepLinkingCallback;
            return;
        }
        throw new Error('MISSING_CALLBACK');
    };
    Provider.prototype.onDynamicRegistration = function (dynamicRegistrationCallback) {
        if (dynamicRegistrationCallback) {
            this.dynamicRegistrationCallback = dynamicRegistrationCallback;
            return;
        }
        throw new Error('MISSING_CALLBACK');
    };
    Provider.prototype.onSessionTimeout = function (sessionTimeoutCallback) {
        if (sessionTimeoutCallback) {
            this.sessionTimeoutCallback = sessionTimeoutCallback;
            return;
        }
        throw new Error('MISSING_CALLBACK');
    };
    Provider.prototype.onInvalidToken = function (invalidTokenCallback) {
        if (invalidTokenCallback) {
            this.invalidTokenCallback = invalidTokenCallback;
            return;
        }
        throw new Error('MISSING_CALLBACK');
    };
    Provider.prototype.onUnregisteredPlatform = function (unregisteredPlatformCallback) {
        if (unregisteredPlatformCallback) {
            this.unregisteredPlatformCallback = unregisteredPlatformCallback;
            return;
        }
        throw new Error('MISSING_CALLBACK');
    };
    Provider.prototype.onInactivePlatform = function (inactivePlatformCallback) {
        if (inactivePlatformCallback) {
            this.inactivePlatformCallback = inactivePlatformCallback;
            return;
        }
        throw new Error('MISSING_CALLBACK');
    };
    Provider.prototype.registerPlatform = function (platform) {
        return __awaiter(this, void 0, void 0, function () {
            var kid, _platform, tempAuth, _a, err_6;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        kid = '';
                        return [4, this.getPlatform(platform.platformUrl, platform.clientId)];
                    case 1:
                        _platform = _d.sent();
                        if (!!_platform) return [3, 15];
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 9, , 14]);
                        kid = crypto.randomBytes(16).toString('hex');
                        _d.label = 3;
                    case 3: return [4, database_1.Database.find(platform_entity_1.PlatformModel, { where: { kid: kid } })];
                    case 4:
                        if (!((_d.sent()).length > 0)) return [3, 5];
                        kid = crypto.randomBytes(16).toString('hex');
                        return [3, 3];
                    case 5:
                        debug_1.Debug.log(this, 'Registering new platform');
                        debug_1.Debug.log(this, 'Platform Url: ' + platform.platformUrl);
                        debug_1.Debug.log(this, 'Platform ClientId: ' + platform.clientId);
                        tempAuth = {
                            authTokenMethod: platform.authToken.method,
                            authTokenKey: platform.authToken.key,
                        };
                        delete platform.authToken;
                        return [4, database_1.Database.save(platform_entity_1.PlatformModel, __assign(__assign(__assign({}, platform), tempAuth), { active: platform.active == undefined ? true : platform.active, kid: kid }))];
                    case 6:
                        _d.sent();
                        return [4, auth_1.Auth.generatePlatformKeyPair(kid, platform.platformUrl, platform.clientId)];
                    case 7:
                        _d.sent();
                        _a = platform_1.Platform.bind;
                        return [4, platform_entity_1.PlatformModel.findOne({
                                where: {
                                    platformUrl: platform.platformUrl,
                                    clientId: platform.clientId,
                                },
                            })];
                    case 8: return [2, new (_a.apply(platform_1.Platform, [void 0, _d.sent()]))()];
                    case 9:
                        err_6 = _d.sent();
                        if (!(kid.trim() !== '')) return [3, 13];
                        return [4, database_1.Database.delete(key_entity_1.PublicKeyModel, { kid: kid })];
                    case 10:
                        _d.sent();
                        return [4, database_1.Database.delete(key_entity_1.PrivateKeyModel, { kid: kid })];
                    case 11:
                        _d.sent();
                        return [4, database_1.Database.delete(platform_entity_1.PlatformModel, {
                                kid: kid,
                            })];
                    case 12:
                        _d.sent();
                        _d.label = 13;
                    case 13:
                        debug_1.Debug.log(this, err_6.message);
                        throw err_6;
                    case 14: return [3, 18];
                    case 15:
                        debug_1.Debug.log(this, 'Platform already registered');
                        return [4, database_1.Database.update(platform_entity_1.PlatformModel, {
                                name: platform.name || _platform.name,
                                authenticationEndpoint: platform.authenticationEndpoint || _platform.authenticationEndpoint,
                                accessTokenEndpoint: platform.accessTokenEndpoint || _platform.accessTokenEndpoint,
                                authTokenMethod: ((_b = platform.authToken) === null || _b === void 0 ? void 0 : _b.method) || _platform.authToken.method,
                                authTokenKey: ((_c = platform.authToken) === null || _c === void 0 ? void 0 : _c.key) || _platform.authToken.key,
                                active: platform.active != undefined ? !!platform.active : _platform.active,
                            }, {
                                platformUrl: platform.platformUrl,
                                clientId: platform.clientId,
                            })];
                    case 16:
                        _d.sent();
                        return [4, this.getPlatform(platform.platformUrl, platform.clientId)];
                    case 17: return [2, _d.sent()];
                    case 18: return [2];
                }
            });
        });
    };
    Provider.prototype.getPlatform = function (url, clientId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, database_1.Database.findOne(platform_entity_1.PlatformModel, {
                            where: { platformUrl: url, clientId: clientId },
                        })];
                    case 1:
                        result = _a.sent();
                        if (!result)
                            return [2, undefined];
                        return [2, new platform_1.Platform(result)];
                }
            });
        });
    };
    Provider.prototype.getPlatforms = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, database_1.Database.find(platform_entity_1.PlatformModel, { where: { platformUrl: url } })];
                    case 1: return [2, (_a.sent()).map(function (plat) { return new platform_1.Platform(plat); })];
                }
            });
        });
    };
    Provider.prototype.getPlatformById = function (platformId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!platformId)
                            throw new Error('MISSING_PLATFORM_ID');
                        return [4, database_1.Database.findOne(platform_entity_1.PlatformModel, {
                                where: { kid: platformId },
                            })];
                    case 1:
                        result = _a.sent();
                        if (!result)
                            return [2, undefined];
                        return [2, new platform_1.Platform(result)];
                }
            });
        });
    };
    Provider.prototype.updatePlatformById = function (platformId, platformInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var platform, oldURL, oldClientId, update, alteredUrlClientIdFlag, _a, err_7;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!platformId) {
                            throw new Error('MISSING_PLATFORM_ID');
                        }
                        if (!platformInfo) {
                            throw new Error('MISSING_PLATFORM_INFO');
                        }
                        return [4, this.getPlatformById(platformId)];
                    case 1:
                        platform = _d.sent();
                        if (!platform)
                            return [2, undefined];
                        oldURL = platform.platformUrl;
                        oldClientId = platform.clientId;
                        update = {
                            platformUrl: platformInfo.platformUrl,
                            clientId: platformInfo.clientId,
                            name: platformInfo.name,
                            authenticationEndpoint: platformInfo.authenticationEndpoint,
                            accessTokenEndpoint: platformInfo.accessTokenEndpoint,
                            authToken: platformInfo.authToken
                                ? {
                                    method: (_b = platformInfo.authToken) === null || _b === void 0 ? void 0 : _b.method,
                                    key: (_c = platformInfo.authToken) === null || _c === void 0 ? void 0 : _c.key,
                                }
                                : undefined,
                        };
                        Object.keys(update).forEach(function (key) {
                            if (update[key] === null || update[key] === undefined) {
                                delete update[key];
                            }
                        });
                        alteredUrlClientIdFlag = false;
                        if (platformInfo.platformUrl || platformInfo.clientId) {
                            if (platformInfo.platformUrl !== oldURL ||
                                platformInfo.clientId !== oldClientId)
                                alteredUrlClientIdFlag = true;
                        }
                        if (!alteredUrlClientIdFlag) return [3, 3];
                        return [4, database_1.Database.findOne(platform_entity_1.PlatformModel, {
                                where: { platformUrl: update.platformUrl, clientId: update.clientId },
                            })];
                    case 2:
                        if (_d.sent()) {
                            throw new Error('URL_CLIENT_ID_COMBINATION_ALREADY_EXISTS');
                        }
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 9, , 13]);
                        if (!alteredUrlClientIdFlag) return [3, 6];
                        return [4, database_1.Database.update(key_entity_1.PublicKeyModel, { platformUrl: update.platformUrl, clientId: update.clientId }, { kid: platformId })];
                    case 4:
                        _d.sent();
                        return [4, database_1.Database.update(key_entity_1.PrivateKeyModel, { platformUrl: update.platformUrl, clientId: update.clientId }, { kid: platformId })];
                    case 5:
                        _d.sent();
                        _d.label = 6;
                    case 6: return [4, database_1.Database.update(platform_entity_1.PlatformModel, update, {
                            kid: platformId,
                        })];
                    case 7:
                        _d.sent();
                        _a = platform_1.Platform.bind;
                        return [4, platform_entity_1.PlatformModel.findOne({ where: { kid: platformId } })];
                    case 8: return [2, new (_a.apply(platform_1.Platform, [void 0, _d.sent()]))()];
                    case 9:
                        err_7 = _d.sent();
                        if (!alteredUrlClientIdFlag) return [3, 12];
                        return [4, database_1.Database.update(key_entity_1.PublicKeyModel, { platformUrl: oldURL, clientId: oldClientId }, { kid: platformId })];
                    case 10:
                        _d.sent();
                        return [4, database_1.Database.update(key_entity_1.PrivateKeyModel, { platformUrl: oldURL, clientId: oldClientId }, { kid: platformId })];
                    case 11:
                        _d.sent();
                        _d.label = 12;
                    case 12:
                        debug_1.Debug.log(this, err_7.message);
                        throw err_7;
                    case 13: return [2];
                }
            });
        });
    };
    Provider.prototype.deletePlatform = function (url, clientId) {
        return __awaiter(this, void 0, void 0, function () {
            var platform;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.getPlatform(url, clientId)];
                    case 1:
                        platform = _a.sent();
                        return [4, (platform === null || platform === void 0 ? void 0 : platform.delete())];
                    case 2: return [2, _a.sent()];
                }
            });
        });
    };
    Provider.prototype.deletePlatformById = function (platformId) {
        return __awaiter(this, void 0, void 0, function () {
            var platform;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.getPlatformById(platformId)];
                    case 1:
                        platform = _a.sent();
                        return [4, (platform === null || platform === void 0 ? void 0 : platform.delete())];
                    case 2: return [2, _a.sent()];
                }
            });
        });
    };
    Provider.prototype.getAllPlatforms = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, database_1.Database.find(platform_entity_1.PlatformModel, {})];
                    case 1: return [2, (_a.sent()).map(function (result) { return new platform_1.Platform(result); })];
                }
            });
        });
    };
    Provider.prototype.redirect = function (res_1, path_1) {
        return __awaiter(this, arguments, void 0, function (res, path, options) {
            var token, pathParts, additionalQueries, params, queries, _i, params_1, _a, key, value, portMatch, formattedPath;
            if (options === void 0) { options = { newResource: false, query: undefined }; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!res || !path)
                            throw new Error('MISSING_ARGUMENT');
                        if (!res.locals.token)
                            return [2, res.redirect(path)];
                        debug_1.Debug.log(this, 'Redirecting to: ', path);
                        token = res.locals.token;
                        pathParts = Url.parse(path);
                        additionalQueries = options && options.query ? options.query : {};
                        if (!(options && (options.newResource || options.isNewResource))) return [3, 2];
                        debug_1.Debug.log(this, 'Changing context token path to: ' + path);
                        return [4, database_1.Database.save(context_token_entity_1.ContextTokenModel, {
                                contextId: token.platformContext.contextId,
                                user: res.locals.token.user,
                                path: path,
                            })];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        params = new URLSearchParams(pathParts.search);
                        queries = {};
                        for (_i = 0, params_1 = params; _i < params_1.length; _i++) {
                            _a = params_1[_i], key = _a[0], value = _a[1];
                            queries[key] = value;
                        }
                        portMatch = pathParts.pathname.match(/:[0-9]*/);
                        if (portMatch) {
                            pathParts.port = portMatch[0].split(':')[1];
                            pathParts.pathname = pathParts.pathname.split(portMatch[0]).join('');
                        }
                        formattedPath = Url.format({
                            protocol: pathParts.protocol,
                            hostname: pathParts.hostname,
                            pathname: pathParts.pathname,
                            port: pathParts.port,
                            auth: pathParts.auth,
                            hash: pathParts.hash,
                            query: __assign(__assign(__assign({}, queries), additionalQueries), { ltik: res.locals.ltik }),
                        });
                        return [2, res.redirect(formattedPath)];
                }
            });
        });
    };
    Provider.prototype.checkAccessToken = function (idToken, scope, accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var platform;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (accessToken)
                            return [2, accessToken];
                        return [4, this.getPlatform(idToken.iss, idToken.clientId)];
                    case 1:
                        platform = _a.sent();
                        if (!platform) {
                            debug_1.Debug.log(this, 'Platform not found');
                            throw new Error('PLATFORM_NOT_FOUND');
                        }
                        if (!platform.active)
                            throw new Error('PLATFORM_NOT_ACTIVATED');
                        debug_1.Debug.log(this, 'Attempting to retrieve platform access_token for [' + idToken.iss + ']');
                        return [4, platform
                                .getAccessToken(scope)
                                .then(function (token) {
                                debug_1.Debug.log(_this, 'Access_token retrieved for [' + idToken.iss + ']');
                                return token;
                            })];
                    case 2: return [2, _a.sent()];
                }
            });
        });
    };
    Provider.prototype.ltiAdvantageLogin = function (request, platform, state) {
        return __awaiter(this, void 0, void 0, function () {
            var query;
            return __generator(this, function (_a) {
                query = {
                    response_type: 'id_token',
                    response_mode: 'form_post',
                    id_token_signed_response_alg: 'RS256',
                    scope: 'openid',
                    client_id: request.client_id || platform.clientId,
                    redirect_uri: request.target_link_uri,
                    login_hint: request.login_hint,
                    nonce: encodeURIComponent(__spreadArray([], Array(25), true).map(function (_) { return ((Math.random() * 36) | 0).toString(36); })
                        .join('')),
                    prompt: 'none',
                    lti_message_hint: request.lti_message_hint,
                    lti_deployment_id: request.lti_deployment_id,
                    state: state,
                };
                if (!request.lti_message_hint)
                    delete query.lti_message_hint;
                if (!request.lti_deployment_id)
                    delete query.lti_deployment_id;
                return [2, query];
            });
        });
    };
    return Provider;
}());
exports.Provider = Provider;
