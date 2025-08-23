"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Provider = void 0;
const server_1 = require("../utils/server");
const platform_1 = require("../utils/platform");
const auth_1 = require("../utils/auth");
const database_1 = require("../utils/database");
const keyset_1 = require("../utils/keyset");
const grade_1 = require("./services/grade");
const deep_linking_1 = require("./services/deep_linking");
const names_and_roles_1 = require("./services/names_and_roles");
const dynamic_registration_1 = require("./services/dynamic_registration");
const Url = require("fast-url-parser");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const debug_1 = require("../utils/debug");
const state_entity_1 = require("../entities/state.entity");
const context_token_entity_1 = require("../entities/context_token.entity");
const id_token_entity_1 = require("../entities/id_token.entity");
const platform_entity_1 = require("../entities/platform.entity");
const key_entity_1 = require("../entities/key.entity");
class Provider {
    constructor() {
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
        this.connectCallback = async (_token, _req, _res, next) => {
            return next();
        };
        this.deepLinkingCallback = async (_token, _req, _res, next) => {
            return next();
        };
        this.dynamicRegistrationCallback = async (req, res) => {
            try {
                if (!req.query.openid_configuration)
                    return res.status(400).send({
                        status: 400,
                        error: 'Bad Request',
                        message: 'Missing parameter: "openid_configuration".',
                    });
                const message = await this.DynamicRegistration.register(req.query.openid_configuration, req.query.registration_token);
                res.setHeader('Content-type', 'text/html');
                res.send(message);
            }
            catch (err) {
                debug_1.Debug.log(this, err);
                if (err.message === 'PLATFORM_ALREADY_REGISTERED')
                    return res.status(403).send({
                        status: 403,
                        error: 'Forbidden',
                        message: 'Platform already registered.',
                    });
                return res.status(500).send({
                    status: 500,
                    error: 'Internal Server Error',
                    message: err.message,
                });
            }
        };
        this.sessionTimeoutCallback = async (_req, res) => {
            return res.status(401).send(res.locals.err);
        };
        this.invalidTokenCallback = async (_req, res) => {
            return res.status(401).send(res.locals.err);
        };
        this.unregisteredPlatformCallback = async (_req, res) => {
            return res.status(400).send({
                status: 400,
                error: 'Bad Request',
                message: 'UNREGISTERED_PLATFORM',
            });
        };
        this.inactivePlatformCallback = async (_req, res) => {
            return res.status(401).send({
                status: 401,
                error: 'Unauthorized',
                message: 'PLATFORM_NOT_ACTIVATED',
            });
        };
    }
    get loginRoute() {
        return this._loginRoute;
    }
    set loginRoute(route) {
        this._loginRoute = route;
    }
    get appRoute() {
        return this._appRoute;
    }
    set appRoute(route) {
        this._appRoute = route;
    }
    get keySetRoute() {
        return this._keySetRoute;
    }
    set keySetRoute(route) {
        this._keySetRoute = route;
    }
    get dynRegRoute() {
        return this._dynRegRoute;
    }
    set dynRegRoute(route) {
        this._dynRegRoute = route;
    }
    get whitelist() {
        return this.whitelistedRoutes;
    }
    set whitelist(routes) {
        const formattedRoutes = [];
        for (const route of routes) {
            const isObject = typeof route === 'object';
            if (isObject) {
                if (!route.route || !route.method)
                    throw new Error('WRONG_FORMAT. Details: Expects string ("/route") or object ({ route: "/route", method: "POST" })');
                formattedRoutes.push({
                    route: route.route,
                    method: route.method.toUpperCase(),
                });
            }
            else {
                formattedRoutes.push({ route, method: 'ALL' });
            }
        }
        this.whitelistedRoutes = [...formattedRoutes];
    }
    get app() {
        return this._app;
    }
    set app(app) {
        this._app = app;
    }
    get DynamicRegistration() {
        return this._DynamicRegistration;
    }
    set DynamicRegistration(dynamicRegistration) {
        this._DynamicRegistration = dynamicRegistration;
    }
    get GradeService() {
        return this._GradeService;
    }
    set GradeService(gradeService) {
        this._GradeService = gradeService;
    }
    get NamesAndRolesService() {
        return this._NamesAndRolesService;
    }
    set NamesAndRolesService(namesAndRolesService) {
        this._NamesAndRolesService = namesAndRolesService;
    }
    get DeepLinkingService() {
        return this._DeepLinkingService;
    }
    set DeepLinkingService(deepLinkingService) {
        this._DeepLinkingService = deepLinkingService;
    }
    getServer() {
        return this.server.server;
    }
    async keyset(_req, res) {
        try {
            const keyset = await keyset_1.Keyset.build();
            return res.status(200).send(keyset);
        }
        catch (err) {
            debug_1.Debug.log(this, err);
            return res.status(500).send({
                status: 500,
                error: 'Internal Server Error',
                message: err.message,
            });
        }
    }
    async clearStateCookie(req, res) {
        const state = req.body.state;
        if (state) {
            debug_1.Debug.log(this, 'Deleting state cookie and Database entry');
            const savedState = await database_1.Database.findOne(state_entity_1.StateModel, {
                where: { state },
            });
            res.clearCookie('state' + state, this.cookieOptions);
            if (savedState) {
                await database_1.Database.delete(state_entity_1.StateModel, { state });
            }
        }
    }
    async setup(encryptionKey, databaseOptions, options) {
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
        await database_1.Database.initializeDatabase(databaseOptions, encryptionKey);
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
        this.server = new server_1.Server(this.encryptionKey, options?.https, options?.cors, options?.ssl, options?.serverAddon);
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
        const sessionValidator = async (req, res, next) => {
            debug_1.Debug.log(this, 'Receiving request at path: ' + req.baseUrl + req.path);
            if (req.path === this.loginRoute ||
                req.path === this.keySetRoute ||
                req.path === this.dynRegRoute) {
                return next();
            }
            debug_1.Debug.log(this, 'Path does not match reserved endpoints');
            try {
                const ltik = req['token'];
                const cookies = req.signedCookies;
                debug_1.Debug.log(this, `Cookies received: ${JSON.stringify(cookies)}`);
                if (!ltik) {
                    const idToken = req.body.id_token ?? req.query.id_token;
                    if (idToken) {
                        debug_1.Debug.log(this, 'Received idtoken for validation');
                        const state = req.body.state ?? req.params.state;
                        debug_1.Debug.log(this, 'Response state: ' + state);
                        const validationCookie = cookies['state' + state];
                        const validationParameters = {
                            iss: validationCookie,
                            maxAge: this.tokenMaxAge,
                        };
                        const valid = await auth_1.Auth.validateToken(this, idToken, this.devMode, validationParameters);
                        const savedState = await database_1.Database.findOne(state_entity_1.StateModel, {
                            where: { state },
                        });
                        res.clearCookie('state' + state, this.cookieOptions);
                        if (savedState)
                            await database_1.Database.delete(state_entity_1.StateModel, { state });
                        debug_1.Debug.log(this, 'Successfully validated token!');
                        const courseId = valid['https://purl.imsglobal.org/spec/lti/claim/context']
                            ? valid['https://purl.imsglobal.org/spec/lti/claim/context'].id
                            : 'NF';
                        const resourceId = valid['https://purl.imsglobal.org/spec/lti/claim/resource_link']
                            ? valid['https://purl.imsglobal.org/spec/lti/claim/resource_link']
                                .id
                            : 'NF';
                        const clientId = valid.clientId;
                        const deploymentId = valid['https://purl.imsglobal.org/spec/lti/claim/deployment_id'];
                        const additionalContextProperties = {
                            path: req.path,
                            roles: valid['https://purl.imsglobal.org/spec/lti/claim/roles'],
                            targetLinkUri: valid['https://purl.imsglobal.org/spec/lti/claim/target_link_uri'],
                            custom: valid['https://purl.imsglobal.org/spec/lti/claim/custom'],
                            launchPresentation: valid['https://purl.imsglobal.org/spec/lti/claim/launch_presentation'],
                            endpoint: valid['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'],
                            namesRoles: valid['https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice'],
                        };
                        const hashOfAdditionalContextProperties = crypto
                            .createHash('sha256')
                            .update(JSON.stringify(additionalContextProperties))
                            .digest('hex');
                        const contextId = encodeURIComponent(valid.iss +
                            clientId +
                            deploymentId +
                            courseId +
                            '_' +
                            resourceId +
                            '_' +
                            hashOfAdditionalContextProperties);
                        const platformCode = encodeURIComponent('lti' +
                            Buffer.from(valid.iss + clientId + deploymentId).toString('base64'));
                        const platformToken = {
                            iss: valid.iss,
                            user: valid.sub,
                            userInfo: {
                                given_name: valid.given_name,
                                family_name: valid.family_name,
                                name: valid.name,
                                email: valid.email,
                            },
                            platformInfo: valid['https://purl.imsglobal.org/spec/lti/claim/tool_platform'],
                            clientId,
                            platformId: valid.platformId,
                            deploymentId,
                        };
                        const contextToken = {
                            contextId,
                            user: valid.sub,
                            context: valid['https://purl.imsglobal.org/spec/lti/claim/context'],
                            resource: valid['https://purl.imsglobal.org/spec/lti/claim/resource_link'],
                            messageType: valid['https://purl.imsglobal.org/spec/lti/claim/message_type'],
                            version: valid['https://purl.imsglobal.org/spec/lti/claim/version'],
                            deepLinkingSettings: valid['https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'],
                            lis: valid['https://purl.imsglobal.org/spec/lti/claim/lis'],
                            ...additionalContextProperties,
                        };
                        await database_1.Database.save(id_token_entity_1.IdTokenModel, platformToken);
                        await database_1.Database.save(context_token_entity_1.ContextTokenModel, contextToken);
                        res.cookie(platformCode, valid.sub, this.cookieOptions);
                        debug_1.Debug.log(this, 'Generating ltik');
                        const newLtikObj = {
                            platformUrl: valid.iss,
                            clientId,
                            deploymentId,
                            platformCode,
                            contextId,
                            user: valid.sub,
                            s: state,
                        };
                        const newLtik = jwt.sign(newLtikObj, this.encryptionKey);
                        const query = new URLSearchParams(req.query);
                        if (savedState) {
                            for (const [key, value] of Object.entries(savedState[0].query)) {
                                query.append(key, String(value));
                            }
                        }
                        query.append('ltik', newLtik);
                        const urlSearchParams = query.toString();
                        debug_1.Debug.log(this, 'Redirecting to endpoint with ltik');
                        res.clearCookie('state' + state);
                        return res.redirect(req.baseUrl + req.path + '?' + urlSearchParams);
                    }
                    else {
                        await this.clearStateCookie(req, res);
                        if (this.whitelistedRoutes.find((r) => ((r.route instanceof RegExp && r.route.test(req.path)) ||
                            r.route === req.path) &&
                            (r.method === 'ALL' ||
                                r.method.toUpperCase() === req.method.toUpperCase()))) {
                            debug_1.Debug.log(this, 'Accessing as whitelisted route');
                            return next();
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
                        return this.invalidTokenCallback(req, res, next);
                    }
                }
                debug_1.Debug.log(this, 'Ltik found');
                let validLtik;
                try {
                    validLtik = jwt.verify(ltik, this.encryptionKey);
                }
                catch (err) {
                    if (this.whitelistedRoutes.find((r) => {
                        if ((r.route instanceof RegExp && r.route.test(req.path)) ||
                            r.route === req.path)
                            return (r.method === 'ALL' || r.method === req.method.toUpperCase());
                        return false;
                    })) {
                        debug_1.Debug.log(this, 'Accessing as whitelisted route');
                        return next();
                    }
                    throw err;
                }
                debug_1.Debug.log(this, 'Ltik successfully verified');
                const platformUrl = validLtik.platformUrl;
                const platformCode = validLtik.platformCode;
                const clientId = validLtik.clientId;
                const deploymentId = validLtik.deploymentId;
                const contextId = validLtik.contextId;
                let user = validLtik.user;
                debug_1.Debug.log(this, `Attempting to retrieve matching session cookie (${platformCode})`);
                const cookieUser = cookies[platformCode];
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
                if (user) {
                    debug_1.Debug.log(this, 'Valid session found');
                    const idTokenRes = await database_1.Database.findOne(id_token_entity_1.IdTokenModel, {
                        where: { iss: platformUrl, clientId, deploymentId, user },
                    });
                    if (!idTokenRes)
                        throw new Error('IDTOKEN_NOT_FOUND_DB');
                    const idToken = JSON.parse(JSON.stringify(idTokenRes));
                    const contextToken = await database_1.Database.findOne(context_token_entity_1.ContextTokenModel, {
                        where: { contextId, user },
                    });
                    if (!contextToken)
                        throw new Error('CONTEXTTOKEN_NOT_FOUND_DB');
                    idToken.platformContext = JSON.parse(JSON.stringify(contextToken));
                    res.locals.context = idToken.platformContext;
                    res.locals.token = idToken;
                    res.locals.ltik = ltik;
                    debug_1.Debug.log(this, 'Passing request to next handler');
                    return next();
                }
                else {
                    debug_1.Debug.log(this, 'No session cookie found');
                    debug_1.Debug.log(this, 'Request body: ', JSON.stringify(req.body));
                    debug_1.Debug.log(this, 'Passing request to session timeout handler');
                    res.locals.err = {
                        status: 401,
                        error: 'Unauthorized',
                        message: 'Session not found.',
                    };
                    return this.sessionTimeoutCallback(req, res, next);
                }
            }
            catch (err) {
                await this.clearStateCookie(req, res);
                debug_1.Debug.log(this, err);
                debug_1.Debug.log(this, 'Passing request to invalid token handler');
                res.locals.err = {
                    status: 401,
                    error: 'Unauthorized',
                    message: err.message,
                    details: {
                        description: 'Error validating ltik or IdToken',
                    },
                };
                return this.invalidTokenCallback(req, res, next);
            }
        };
        this.app.use(sessionValidator);
        this.app.all(this.loginRoute, async (req, res) => {
            const params = { ...req.query, ...req.body };
            try {
                if (!params.iss || !params.login_hint || !params.target_link_uri)
                    return res.status(400).send({
                        status: 400,
                        error: 'Bad Request',
                        message: 'MISSING_LOGIN_PARAMETERS',
                    });
                const iss = params.iss;
                const clientId = params.client_id;
                debug_1.Debug.log(this, 'Receiving a login request from: ' + iss + ', clientId: ' + clientId);
                let platform;
                if (clientId)
                    platform = await this.getPlatform(iss, clientId);
                else
                    platform = (await this.getPlatforms(iss))[0];
                if (platform) {
                    if (!platform.active)
                        return this.inactivePlatformCallback(req, res);
                    debug_1.Debug.log(this, 'Redirecting to platform authentication endpoint');
                    let state = encodeURIComponent(crypto.randomBytes(25).toString('hex'));
                    debug_1.Debug.log(this, 'Target Link URI: ', params.target_link_uri);
                    if (params.target_link_uri.includes('?')) {
                        const rawQueries = new URLSearchParams('?' + params.target_link_uri.split('?')[1]);
                        while (await database_1.Database.findOne(state_entity_1.StateModel, { where: { state } })) {
                            state = encodeURIComponent(crypto.randomBytes(25).toString('hex'));
                            debug_1.Debug.log(this, 'Generated state: ', state);
                        }
                        const queries = {};
                        for (const [key, value] of rawQueries) {
                            queries[key] = value;
                        }
                        params.target_link_uri = params.target_link_uri.split('?')[0];
                        debug_1.Debug.log(this, 'Query parameters found: ', queries);
                        debug_1.Debug.log(this, 'Final Redirect URI: ', params.target_link_uri);
                        await database_1.Database.save(state_entity_1.StateModel, {
                            state,
                            query: queries,
                        });
                    }
                    const cookieOptions = JSON.parse(JSON.stringify(this.cookieOptions));
                    cookieOptions.maxAge = 60 * 1000;
                    res.cookie('state' + state, iss, cookieOptions);
                    const query = await this.ltiAdvantageLogin(params, platform, state);
                    debug_1.Debug.log(this, `Login request: ${platform.authenticationEndpoint}, ${JSON.stringify(query)}`);
                    res.redirect(Url.format({
                        pathname: platform.authenticationEndpoint,
                        query,
                    }));
                }
                else {
                    debug_1.Debug.log(this, 'Unregistered platform attempting connection: ' +
                        iss +
                        ', clientId: ' +
                        clientId);
                    return this.unregisteredPlatformCallback(req, res);
                }
            }
            catch (err) {
                debug_1.Debug.log(this, err);
                return res.status(500).send({
                    status: 500,
                    error: 'Internal Server Error',
                    message: err.message,
                });
            }
        });
        this.app.get(this.keySetRoute, async (req, res) => {
            return this.keyset(req, res);
        });
        this.app.all(this.dynRegRoute, async (req, res, next) => {
            if (this.DynamicRegistration)
                return this.dynamicRegistrationCallback(req, res, next);
            return res.status(403).send({
                status: 403,
                error: 'Forbidden',
                message: 'Dynamic registration is disabled.',
            });
        });
        this.app.all(this.appRoute, async (req, res, next) => {
            if (res.locals.context &&
                res.locals.context.messageType === 'LtiDeepLinkingRequest') {
                return this.deepLinkingCallback(res.locals.token, req, res, next);
            }
            return this.connectCallback(res.locals.token, req, res, next);
        });
        this.isSetup = true;
        return this;
    }
    async deploy(options = {}) {
        Object.keys(options).forEach((k) => {
            if (options[k] === null || options[k] === undefined) {
                delete options[k];
            }
        });
        options = {
            port: 3000,
            silent: false,
            serverless: false,
            ...options,
        };
        if (!this.setup)
            throw new Error('PROVIDER_NOT_SETUP');
        try {
            if (options && options.serverless) {
                if (!options.silent) {
                    console.log('LTI-TYPESCRIPT started in serverless mode...');
                }
            }
            else {
                await this.server.listen(options.port);
                debug_1.Debug.log(this, 'Ltijs started listening on port: ', options.port);
                const message = 'LTI Provider is listening on port ' +
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
                    console.log(`
    __  __________   ________  ______  ___________ __________  ________  ______
   / / /_  __/  _/  /_  __/\\ \\/ / __ \\/ ____/ ___// ____/ __ \\/  _/ __ \\/_  __/
  / /   / /  / /_____/ /    \\  / /_/ / __/  \\__ \\/ /   / /_/ // // /_/ / / /   
 / /___/ / _/ /_____/ /     / / ____/ /___ ___/ / /___/ _, _// // ____/ / /    
/_____/_/ /___/    /_/     /_/_/   /_____//____/\\____/_/ |_/___/_/     /_/                                                                 

          `, message);
                }
            }
            if (this.devMode && !options.silent)
                console.log('\nStarting in Dev Mode, state validation and session cookies will not be required. THIS SHOULD NOT BE USED IN A PRODUCTION ENVIRONMENT!');
            process.on('SIGINT', async () => {
                await this.close(options.silent);
                process.exit();
            });
            return true;
        }
        catch (err) {
            console.log('Error during deployment: ', err);
            await this.close(options.silent);
            process.exit();
        }
    }
    async close(silent = true) {
        if (!silent)
            console.log('\nClosing server...');
        this.server.close();
        if (!silent)
            console.log('Closing connection to the database...');
        await database_1.Database.close();
        if (!silent)
            console.log('Shutdown complete.');
    }
    onConnect(connectCallback) {
        if (connectCallback) {
            this.connectCallback = connectCallback;
            return;
        }
        throw new Error('MISSING_CALLBACK');
    }
    onDeepLinking(deepLinkingCallback) {
        if (deepLinkingCallback) {
            this.deepLinkingCallback = deepLinkingCallback;
            return;
        }
        throw new Error('MISSING_CALLBACK');
    }
    onDynamicRegistration(dynamicRegistrationCallback) {
        if (dynamicRegistrationCallback) {
            this.dynamicRegistrationCallback = dynamicRegistrationCallback;
            return;
        }
        throw new Error('MISSING_CALLBACK');
    }
    onSessionTimeout(sessionTimeoutCallback) {
        if (sessionTimeoutCallback) {
            this.sessionTimeoutCallback = sessionTimeoutCallback;
            return;
        }
        throw new Error('MISSING_CALLBACK');
    }
    onInvalidToken(invalidTokenCallback) {
        if (invalidTokenCallback) {
            this.invalidTokenCallback = invalidTokenCallback;
            return;
        }
        throw new Error('MISSING_CALLBACK');
    }
    onUnregisteredPlatform(unregisteredPlatformCallback) {
        if (unregisteredPlatformCallback) {
            this.unregisteredPlatformCallback = unregisteredPlatformCallback;
            return;
        }
        throw new Error('MISSING_CALLBACK');
    }
    onInactivePlatform(inactivePlatformCallback) {
        if (inactivePlatformCallback) {
            this.inactivePlatformCallback = inactivePlatformCallback;
            return;
        }
        throw new Error('MISSING_CALLBACK');
    }
    async registerPlatform(platform) {
        let kid = '';
        const _platform = await this.getPlatform(platform.platformUrl, platform.clientId);
        if (!_platform) {
            try {
                kid = crypto.randomBytes(16).toString('hex');
                while ((await database_1.Database.find(platform_entity_1.PlatformModel, { where: { kid } })).length > 0) {
                    kid = crypto.randomBytes(16).toString('hex');
                }
                debug_1.Debug.log(this, 'Registering new platform');
                debug_1.Debug.log(this, 'Platform Url: ' + platform.platformUrl);
                debug_1.Debug.log(this, 'Platform ClientId: ' + platform.clientId);
                const tempAuth = {
                    authTokenMethod: platform.authToken.method,
                    authTokenKey: platform.authToken.key,
                };
                delete platform.authToken;
                await database_1.Database.save(platform_entity_1.PlatformModel, {
                    ...platform,
                    ...tempAuth,
                    active: platform.active == undefined ? true : platform.active,
                    kid,
                });
                await auth_1.Auth.generatePlatformKeyPair(kid, platform.platformUrl, platform.clientId);
                return new platform_1.Platform(await platform_entity_1.PlatformModel.findOne({
                    where: {
                        platformUrl: platform.platformUrl,
                        clientId: platform.clientId,
                    },
                }));
            }
            catch (err) {
                if (kid.trim() !== '') {
                    await database_1.Database.delete(key_entity_1.PublicKeyModel, { kid });
                    await database_1.Database.delete(key_entity_1.PrivateKeyModel, { kid });
                    await database_1.Database.delete(platform_entity_1.PlatformModel, {
                        kid,
                    });
                }
                debug_1.Debug.log(this, err.message);
                throw err;
            }
        }
        else {
            debug_1.Debug.log(this, 'Platform already registered');
            await database_1.Database.update(platform_entity_1.PlatformModel, {
                name: platform.name || _platform.name,
                authenticationEndpoint: platform.authenticationEndpoint || _platform.authenticationEndpoint,
                accessTokenEndpoint: platform.accessTokenEndpoint || _platform.accessTokenEndpoint,
                authTokenMethod: platform.authToken?.method || _platform.authToken.method,
                authTokenKey: platform.authToken?.key || _platform.authToken.key,
                active: platform.active != undefined ? !!platform.active : _platform.active,
            }, {
                platformUrl: platform.platformUrl,
                clientId: platform.clientId,
            });
            return await this.getPlatform(platform.platformUrl, platform.clientId);
        }
    }
    async getPlatform(url, clientId) {
        const result = await database_1.Database.findOne(platform_entity_1.PlatformModel, {
            where: { platformUrl: url, clientId },
        });
        if (!result)
            return undefined;
        return new platform_1.Platform(result);
    }
    async getPlatforms(url) {
        return (await database_1.Database.find(platform_entity_1.PlatformModel, { where: { platformUrl: url } })).map((plat) => new platform_1.Platform(plat));
    }
    async getPlatformById(platformId) {
        if (!platformId)
            throw new Error('MISSING_PLATFORM_ID');
        const result = await database_1.Database.findOne(platform_entity_1.PlatformModel, {
            where: { kid: platformId },
        });
        if (!result)
            return undefined;
        return new platform_1.Platform(result);
    }
    async updatePlatformById(platformId, platformInfo) {
        if (!platformId) {
            throw new Error('MISSING_PLATFORM_ID');
        }
        if (!platformInfo) {
            throw new Error('MISSING_PLATFORM_INFO');
        }
        const platform = await this.getPlatformById(platformId);
        if (!platform)
            return undefined;
        const oldURL = platform.platformUrl;
        const oldClientId = platform.clientId;
        const update = {
            platformUrl: platformInfo.platformUrl,
            clientId: platformInfo.clientId,
            name: platformInfo.name,
            authenticationEndpoint: platformInfo.authenticationEndpoint,
            accessTokenEndpoint: platformInfo.accessTokenEndpoint,
            authToken: platformInfo.authToken
                ? {
                    method: platformInfo.authToken?.method,
                    key: platformInfo.authToken?.key,
                }
                : undefined,
        };
        Object.keys(update).forEach((key) => {
            if (update[key] === null || update[key] === undefined) {
                delete update[key];
            }
        });
        let alteredUrlClientIdFlag = false;
        if (platformInfo.platformUrl || platformInfo.clientId) {
            if (platformInfo.platformUrl !== oldURL ||
                platformInfo.clientId !== oldClientId)
                alteredUrlClientIdFlag = true;
        }
        if (alteredUrlClientIdFlag) {
            if (await database_1.Database.findOne(platform_entity_1.PlatformModel, {
                where: { platformUrl: update.platformUrl, clientId: update.clientId },
            })) {
                throw new Error('URL_CLIENT_ID_COMBINATION_ALREADY_EXISTS');
            }
        }
        try {
            if (alteredUrlClientIdFlag) {
                await database_1.Database.update(key_entity_1.PublicKeyModel, { platformUrl: update.platformUrl, clientId: update.clientId }, { kid: platformId });
                await database_1.Database.update(key_entity_1.PrivateKeyModel, { platformUrl: update.platformUrl, clientId: update.clientId }, { kid: platformId });
            }
            await database_1.Database.update(platform_entity_1.PlatformModel, update, {
                kid: platformId,
            });
            return new platform_1.Platform(await platform_entity_1.PlatformModel.findOne({ where: { kid: platformId } }));
        }
        catch (err) {
            if (alteredUrlClientIdFlag) {
                await database_1.Database.update(key_entity_1.PublicKeyModel, { platformUrl: oldURL, clientId: oldClientId }, { kid: platformId });
                await database_1.Database.update(key_entity_1.PrivateKeyModel, { platformUrl: oldURL, clientId: oldClientId }, { kid: platformId });
            }
            debug_1.Debug.log(this, err.message);
            throw err;
        }
    }
    async deletePlatform(url, clientId) {
        const platform = await this.getPlatform(url, clientId);
        return await platform?.delete();
    }
    async deletePlatformById(platformId) {
        const platform = await this.getPlatformById(platformId);
        return await platform?.delete();
    }
    async getAllPlatforms() {
        return (await database_1.Database.find(platform_entity_1.PlatformModel, {})).map((result) => new platform_1.Platform(result));
    }
    async redirect(res, path, options = { newResource: false, query: undefined }) {
        if (!res || !path)
            throw new Error('MISSING_ARGUMENT');
        if (!res.locals.token)
            return res.redirect(path);
        debug_1.Debug.log(this, 'Redirecting to: ', path);
        const token = res.locals.token;
        const pathParts = Url.parse(path);
        const additionalQueries = options && options.query ? options.query : {};
        if (options && (options.newResource || options.isNewResource)) {
            debug_1.Debug.log(this, 'Changing context token path to: ' + path);
            await database_1.Database.save(context_token_entity_1.ContextTokenModel, {
                contextId: token.platformContext.contextId,
                user: res.locals.token.user,
                path,
            });
        }
        const params = new URLSearchParams(pathParts.search);
        const queries = {};
        for (const [key, value] of params) {
            queries[key] = value;
        }
        const portMatch = pathParts.pathname.match(/:[0-9]*/);
        if (portMatch) {
            pathParts.port = portMatch[0].split(':')[1];
            pathParts.pathname = pathParts.pathname.split(portMatch[0]).join('');
        }
        const formattedPath = Url.format({
            protocol: pathParts.protocol,
            hostname: pathParts.hostname,
            pathname: pathParts.pathname,
            port: pathParts.port,
            auth: pathParts.auth,
            hash: pathParts.hash,
            query: {
                ...queries,
                ...additionalQueries,
                ltik: res.locals.ltik,
            },
        });
        return res.redirect(formattedPath);
    }
    async checkAccessToken(idToken, scope, accessToken) {
        if (accessToken)
            return accessToken;
        const platform = await this.getPlatform(idToken.iss, idToken.clientId);
        if (!platform) {
            debug_1.Debug.log(this, 'Platform not found');
            throw new Error('PLATFORM_NOT_FOUND');
        }
        if (!platform.active)
            throw new Error('PLATFORM_NOT_ACTIVATED');
        debug_1.Debug.log(this, 'Attempting to retrieve platform access_token for [' + idToken.iss + ']');
        return await platform
            .getAccessToken(scope)
            .then((token) => {
            debug_1.Debug.log(this, 'Access_token retrieved for [' + idToken.iss + ']');
            return token;
        });
    }
    async ltiAdvantageLogin(request, platform, state) {
        const query = {
            response_type: 'id_token',
            response_mode: 'form_post',
            id_token_signed_response_alg: 'RS256',
            scope: 'openid',
            client_id: request.client_id || platform.clientId,
            redirect_uri: request.target_link_uri,
            login_hint: request.login_hint,
            nonce: encodeURIComponent([...Array(25)]
                .map((_) => ((Math.random() * 36) | 0).toString(36))
                .join('')),
            prompt: 'none',
            lti_message_hint: request.lti_message_hint,
            lti_deployment_id: request.lti_deployment_id,
            state,
        };
        if (!request.lti_message_hint)
            delete query.lti_message_hint;
        if (!request.lti_deployment_id)
            delete query.lti_deployment_id;
        return query;
    }
}
exports.Provider = Provider;
//# sourceMappingURL=provider.js.map