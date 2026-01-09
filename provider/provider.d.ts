import { Platform } from '../utils/platform';
import { GradeService } from './services/grade';
import { DeepLinkingService } from './services/deep_linking';
import { NamesAndRolesService } from './services/names_and_roles';
import { DynamicRegistrationService } from './services/dynamic_registration';
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';
import { Express, NextFunction, Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { AccessTokenType, IdToken, PlatformProperties, ProviderOptions, RouteType } from '../utils/types';
import { DataSourceOptions } from 'typeorm';
export type Callback = (req: ExpressRequest, res: ExpressResponse, next?: NextFunction) => Promise<void | ExpressResponse> | (void | ExpressResponse);
export type CallbackWithToken = (token: IdToken, req: ExpressRequest, res: ExpressResponse, next?: NextFunction) => Promise<void | ExpressResponse> | (void | ExpressResponse);
export declare function register(encryptionKey: string, databaseOptions: DataSourceOptions, options: ProviderOptions): Promise<Provider>;
/**
 * @descripttion LTI Provider Class that implements the LTI 1.3 protocol and services.
 */
export declare class Provider {
    private _prefix;
    /**
     * @description Gets the prefix, if any, used for the application.
     * @returns {string}
     */
    get prefix(): string;
    set prefix(prefix: string);
    private _loginRoute;
    /**
     * @description Gets the login route responsible for dealing with the OIDC login flow.
     * @returns {String}
     */
    get loginRoute(): string;
    set loginRoute(route: string);
    private _appRoute;
    /**
     * @description Gets the main application route that will receive the final decoded Idtoken at the end of a successful launch.
     * @returns {String}
     */
    get appRoute(): string;
    set appRoute(route: string);
    private _keySetRoute;
    /**
     * @description Gets the keyset route that will be used to retrieve a public jwk keyset.
     * @returns {String}
     */
    get keySetRoute(): string;
    set keySetRoute(route: string);
    private _dynRegRoute;
    /**
     * @description Gets the dynamic registration route that will be used to register platforms dynamically.
     * @returns {String}
     */
    get dynRegRoute(): string;
    set dynRegRoute(route: string);
    private whitelistedRoutes;
    /**
     * @description List of routes which will bypass the Ltijs authentication protocol. If validation fails, these routes are still accessed but aren't given an idToken.
     * @return Array<RouteType>
     */
    get whitelist(): RouteType[];
    /**
     * @description Whitelists routes to bypass the Ltijs authentication protocol. If validation fails, these routes are still accessed but aren't given an idToken.
     * @param {Array<string | RouteType[]>} routes - Routes to be whitelisted
     */
    set whitelist(routes: (string | RouteType)[]);
    private encryptionKey;
    private devMode;
    private tokenMaxAge;
    private cookieOptions;
    private isSetup;
    private server;
    private _app;
    get app(): Express;
    set app(app: Express);
    private _DynamicRegistration;
    get DynamicRegistration(): DynamicRegistrationService;
    set DynamicRegistration(dynamicRegistration: DynamicRegistrationService);
    private _GradeService;
    get GradeService(): GradeService;
    set GradeService(gradeService: GradeService);
    private _NamesAndRolesService;
    get NamesAndRolesService(): NamesAndRolesService;
    set NamesAndRolesService(namesAndRolesService: NamesAndRolesService);
    private _DeepLinkingService;
    get DeepLinkingService(): DeepLinkingService;
    set DeepLinkingService(deepLinkingService: DeepLinkingService);
    getServer(): HttpServer | HttpsServer;
    private connectCallback;
    private deepLinkingCallback;
    private dynamicRegistrationCallback;
    private sessionTimeoutCallback;
    private invalidTokenCallback;
    private unregisteredPlatformCallback;
    private inactivePlatformCallback;
    private keyset;
    private clearStateCookie;
    /**
     * @description Provider configuration method.
     * @param {String} encryptionKey - Secret used to sign cookies and encrypt other info.
     * @param {DataSourceOptions} databaseOptions Database options
     * @param {Object} [options] - Lti Provider options.
     * @param {String} [options.appRoute = '/'] - Lti Provider main route. If no option is set '/' is used.
     * @param {String} [options.loginRoute = '/login'] - Lti Provider login route. If no option is set '/login' is used.
     * @param {String} [options.keysetRoute = '/keys'] - Lti Provider public jwk keyset route. If no option is set '/keys' is used.
     * @param {String} [options.dynRegRoute = '/register'] - Dynamic registration route.
     * @param {Boolean} [options.https = false] - Set this as true in development if you are not using any web server to redirect to your tool (like Nginx) as https and are planning to configure ssl through Express.
     * @param {Object} [options.ssl] - SSL certificate and key if https is enabled.
     * @param {String} [options.ssl.key] - SSL key.
     * @param {String} [options.ssl.cert] - SSL certificate.
     * @param {String} [options.staticPath] - The path for the static files your application might serve (Ex: _dirname+"/public")
     * @param {Boolean} [options.cors = true] - If set to false, disables cors.
     * @param {Function} [options.serverAddon] - Allows the execution of a method inside of the server contructor. Can be used to register middlewares.
     * @param {Object} [options.cookies] - Cookie configuration. Allows you to configure, sameSite and secure parameters.
     * @param {Boolean} [options.cookies.secure = false] - Cookie secure parameter. If true, only allows cookies to be passed over https.
     * @param {String} [options.cookies.sameSite = 'Lax'] - Cookie sameSite parameter. If cookies are going to be set across domains, set this parameter to 'None'.
     * @param {String} [options.cookies.domain] - Cookie domain parameter. This parameter can be used to specify a domain so that the cookies set by Ltijs can be shared between subdomains.
     * @param {Boolean} [options.devMode = false] - If true, does not require state and session cookies to be present (If present, they are still validated). This allows ltijs to work on development environments where cookies cannot be set. THIS SHOULD NOT BE USED IN A PRODUCTION ENVIRONMENT.
     * @param {Number} [options.tokenMaxAge = 10] - Sets the idToken max age allowed in seconds. Defaults to 10 seconds. If false, disables max age validation.
     * @param {Object} [options.dynReg] - Setup for the Dynamic Registration Service.
     * @param {String} [options.dynReg.url] - Tool Provider main URL. (Ex: 'https://tool.example.com')
     * @param {String} [options.dynReg.name] - Tool Provider name. (Ex: 'Tool Provider')
     * @param {String} [options.dynReg.logo] - Tool Provider logo. (Ex: 'https://client.example.org/logo.png')
     * @param {String} [options.dynReg.description] - Tool Provider description. (Ex: 'Tool description')
     * @param {Array<String>} [options.dynReg.redirectUris] - Additional redirect URIs. (Ex: ['https://tool.example.com/launch'])
     * @param {Object} [options.dynReg.customParameters] - Custom parameters object. (Ex: { key: 'value' })
     * @param {Boolean} [options.dynReg.autoActivate = false] - Platform auto activation flag. If true, every Platform registered dynamically is immediately activated. Defaults to false.
     * @param {Boolean} [options.dynReg.useDeepLinking = true] - Deep Linking usage flag. If true, sets up deep linking in the platform. Defaults to true.
     */
    setup(encryptionKey: string, databaseOptions: DataSourceOptions, options: ProviderOptions): Promise<this>;
    /**
     * @description Starts listening to a given port for LTI requests and opens connection to the database.
     * @param {Object} [options] - Deployment options.
     * @param {Number} [options.port] - Deployment port. 3000 by default.
     * @param {Boolean} [options.silent] - If true, disables initial startup message.
     * @param {Boolean} [options.serverless] - If true, Ltijs does not start an Express server instance. This allows usage as a middleware and with services like AWS. Ignores 'port' parameter.
     * @returns {Promise<true>}
     */
    deploy(options?: {
        port?: number;
        silent?: boolean;
        serverless?: boolean;
    }): Promise<true>;
    /**
     * @description Closes connection to database and stops server.
     * @param {Boolean} silent Whether or not to log messages during closure
     * @returns {Promise<void>}
     */
    close(silent?: boolean): Promise<void>;
    /**
     * @description Sets the callback function called whenever there's a sucessfull lti 1.3 launch, exposing a "token" object containing the idtoken information.
     * @param {CallbackWithToken} connectCallback - Callback function called everytime a platform sucessfully launches to the provider.
     * @example .onConnect((token, request, response)=>{response.send('OK')})
     * @returns {void}
     */
    onConnect(connectCallback: CallbackWithToken): void;
    /**
     * @description Sets the callback function called whenever there's a sucessfull deep linking launch, exposing a "token" object containing the idtoken information.
     * @param {CallbackWithToken} deepLinkingCallback - Callback function called everytime a platform sucessfully launches a deep linking request.
     * @example .onDeepLinking((token, request, response)=>{response.send('OK')})
     * @returns {void}
     */
    onDeepLinking(deepLinkingCallback: CallbackWithToken): void;
    /**
     * @description Sets the callback function called whenever there's a sucessfull dynamic registration request, allowing the registration flow to be customized.
     * @param {Callback} dynamicRegistrationCallback - Callback function called everytime the LTI Provider receives a dynamic registration request.
     * @returns {void}
     */
    onDynamicRegistration(dynamicRegistrationCallback: Callback): void;
    /**
     * @description Sets the callback function called when no valid session is found during a request validation.
     * @param {Callback} sessionTimeoutCallback - Callback method.
     * @example .onSessionTimeout((request, response)=>{response.send('Session timeout')})
     * @returns {void}
     */
    onSessionTimeout(sessionTimeoutCallback: Callback): void;
    /**
     * @description Sets the callback function called when the token received fails to be validated.
     * @param {Callback} invalidTokenCallback - Callback method.
     * @example .onInvalidToken((request, response)=>{response.send('Invalid token')})
     * @returns {void}
     */
    onInvalidToken(invalidTokenCallback: Callback): void;
    /**
     * @description Sets the callback function called when the Platform attempting to login is not registered.
     * @param {Callback} unregisteredPlatformCallback - Callback method.
     * @example .onUnregisteredPlatform((request, response)=>{response.send('Unregistered Platform')})
     * @returns {void}
     */
    onUnregisteredPlatform(unregisteredPlatformCallback: Callback): void;
    /**
     * @description Sets the callback function called when the Platform attempting to login is not activated.
     * @param {Callback} inactivePlatformCallback - Callback method.
     * @example .onInactivePlatform((request, response)=>{response.send('Platform not activated')})
     * @returns {void}
     */
    onInactivePlatform(inactivePlatformCallback: Callback): void;
    /**
     * @description Registers a platform.
     * @param {Omit<PlatformProperties,'kid'>} platform
     * @returns {Promise<Platform>}
     */
    registerPlatform(platform: Omit<PlatformProperties, 'kid'>): Promise<Platform>;
    /**
     * @description Gets a platform.
     * @param {string} url - Platform url.
     * @param {string} [clientId] - Tool clientId.
     * @returns {Promise<Platform | undefined>}
     */
    getPlatform(url: string, clientId: string): Promise<Platform | undefined>;
    /**
     * @description Gets all platforms matching the passed URL.
     * @param {string} url - Platform url.
     * @returns {Promise<Platform[]>}
     */
    getPlatforms(url: string): Promise<Platform[]>;
    /**
     * @description Gets a platform by the platformId.
     * @param {String} platformId - Platform Id.
     * @returns {Promise<Platform | undefined>}
     */
    getPlatformById(platformId: string): Promise<Platform | undefined>;
    /**
     * @description Updates a platform by the platformId.
     * @param {String} platformId - Platform Id.
     * @param {PlatformProperties} platformInfo - Update Information.
     * @returns {Promise<Platform | undefined>}
     */
    updatePlatformById(platformId: string, platformInfo: Partial<PlatformProperties>): Promise<Platform | undefined>;
    /**
     * @description Deletes a platform.
     * @param {string} url - Platform url.
     * @param {String} clientId - Tool clientId.
     * @returns {Promise<Platform | undefined>}
     */
    deletePlatform(url: string, clientId: string): Promise<void>;
    /**
     * @description Deletes a platform by the platform Id.
     * @param {string} platformId - Platform Id.
     * @returns {Promise<Platform | undefined>}
     */
    deletePlatformById(platformId: string): Promise<void>;
    /**
     * @description Gets all platforms.
     * @returns {Promise<Platform[]>}
     */
    getAllPlatforms(): Promise<Platform[]>;
    /**
     * @description Redirects to a new location. Passes Ltik if present.
     * @param {Object} res - Express response object.
     * @param {String} path - Redirect path.
     * @param {Object} [options] - Redirection options.
     * @param {Boolean} [options.newResource = false] - If true, changes the path variable on the context token.
     * @param {Object} [options.query] - Query parameters that will be added to the URL.
     * @example lti.redirect(response, '/path', { newResource: true })
     */
    redirect(res: ExpressResponse, path: string, options?: {
        newResource?: boolean;
        isNewResource?: boolean;
        query?: Record<string, any>;
    }): Promise<void>;
    /**
     * Issues an access token for the given scope given the ID token. If the optionally passed access token is valid for the scope, it is used instead.
     * @param {IdToken} idToken Id token representing the caller
     * @param {string} scope The scope(s) desired in a space-delimited string.
     * @param {AccessTokenType} accessToken (Optional) An access token that may be used for the request instead of generating a new one.
     * @return {Promise<AccessTokenType>}
     */
    checkAccessToken(idToken: IdToken, scope: string, accessToken?: AccessTokenType): Promise<AccessTokenType>;
    /**
     * @description Handles the Lti 1.3 initial login flow (OIDC protocol).
     * @param {LtiAdvantageLoginParams} request - Login request object sent by consumer.
     * @param {Platform} platform - Platform Object.
     * @param {String} state - State parameter, used to validate the response.
     */
    private ltiAdvantageLogin;
}
