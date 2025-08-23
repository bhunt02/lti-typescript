declare module "utils/debug" {
    export class Debug {
        private enabled;
        constructor(enabled?: boolean);
        private static _DebugInstance;
        static get DebugInstance(): Debug;
        private static set DebugInstance(value);
        static init(debug?: boolean): void;
        static log(caller: any, ...args: any[]): void;
    }
}
declare module "utils/server" {
    import * as express from 'express';
    import {Server as HttpsServer} from 'https';
    import {Server as HttpServer} from 'http';
    export type SSLType = {
        key: string;
        cert: string;
    };
    export class Server {
        app: express.Express;
        server?: HttpsServer | HttpServer;
        ssl?: SSLType;
        constructor(encryptionKey: string, https?: boolean, corsOpt?: boolean, ssl?: SSLType, serverAddon?: (...params: any[]) => any);
        listen(port: number): Promise<unknown>;
        setStaticPath(path: string): void;
        close(): void;
    }
}
declare module "utils/types" {
    import {CookieOptions} from 'express';
    import {BaseEntity} from 'typeorm';
    import {JwtPayload} from 'jsonwebtoken';
    export type ProviderOptions = {
        appUrl?: string;
        loginUrl?: string;
        keySetUrl?: string;
        dynRegUrl?: string;
        appRoute?: string;
        loginRoute?: string;
        keySetRoute?: string;
        dynRegRoute?: string;
        staticPath?: string;
        https?: boolean;
        ssl?: {
            key: string;
            cert: string;
            staticPath: string;
        };
        cors?: boolean;
        serverAddon?: (...params: any[]) => any;
        cookies?: CookieOptions;
        devMode?: boolean;
        debug?: boolean;
        tokenMaxAge?: number;
        dynReg?: DynamicRegistrationOptions;
    };
    export type DynamicRegistrationOptions = {
        url: string;
        name: string;
        logo?: string;
        description?: string;
        redirectUris?: string[];
        customParameters?: Record<string, string>;
        autoActivate?: boolean;
        useDeepLinking?: boolean;
    };
    export type DynamicRegistrationSecondaryOptions = {
        initiate_login_uri?: string;
        redirect_uris?: string[];
        client_name?: string;
        jwks_uri?: string;
        logo_uri?: string;
        'https://purl.imsglobal.org/spec/lti-tool-configuration'?: Partial<LtiPlatformRegistration>;
    };
    export type VerifiedToken = {
        'https://purl.imsglobal.org/spec/lti/claim/tool_platform': PlatformInfoType;
        'https://purl.imsglobal.org/spec/lti/claim/roles': string[];
        'https://purl.imsglobal.org/spec/lti/claim/target_link_uri': string;
        'https://purl.imsglobal.org/spec/lti/claim/custom': Record<string, any>;
        'https://purl.imsglobal.org/spec/lti/claim/launch_presentation': IMSLaunchPresentation;
        'https://purl.imsglobal.org/spec/lti-ags/claim/endpoint': IMSGradeEndpoint;
        'https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice': any;
        'https://purl.imsglobal.org/spec/lti/claim/context'?: IMSContext;
        'https://purl.imsglobal.org/spec/lti/claim/resource_link'?: IMSResourceLink;
        'https://purl.imsglobal.org/spec/lti/claim/deployment_id'?: string;
    };
    export type IMSGradeEndpoint = {
        scope: string[];
        lineitems: string;
        lineitem: string;
    };
    export type IMSContext = {
        id: string;
        label?: string;
        title?: string;
        type?: string[];
    };
    export type IMSResourceLink = {
        id: string;
        description?: string;
        title?: string;
    };
    export type IMSLaunchPresentation = {
        document_target?: 'iframe' | 'frame' | 'window';
        height?: string | number;
        width?: string | number;
        return_url?: string;
        locale?: string;
    };
    export type DeepLinkingSettings = {
        deep_link_return_url: string;
        accept_types: ('link' | 'file' | 'html' | 'ltiResourceLink' | 'image')[];
        accept_media_types?: string;
        accept_presentation_document_targets: ('iframe' | 'window' | 'embed')[];
        accept_multiple?: boolean | 'true' | 'false';
        auto_create?: boolean | 'true' | 'false';
        title: string;
        text: string;
        data: string;
    };
    export type LISClaim = {
        person_sourcedid?: string;
        course_offering_sourcedid?: string;
        course_section_sourcedid?: string;
    };
    export type ContextProperties = MainContextProperties & AdditionalContext;
    export type MainContextProperties = {
        contextId: string;
        user: string;
        context: IMSContext;
        resource: IMSResourceLink;
        messageType: string;
        version: string;
        deepLinkingSettings: DeepLinkingSettings;
        lis: LISClaim;
    };
    export type AdditionalContext = {
        path: string;
        roles: string[];
        targetLinkUri: string;
        custom: any;
        launchPresentation: IMSLaunchPresentation;
        endpoint: IMSGradeEndpoint;
        namesRoles: IMSNamesRoles;
    };
    export type IMSNamesRoles = {
        context_memberships_url: string;
    };
    export type ValidatedToken = JwtPayload & UserInfo & VerifiedToken & {
        platformId: string;
        clientId: string;
    };
    export type IdToken = {
        iss: string;
        sub: string;
        aud: string;
        clientId: string;
        deploymentId: string;
        platformId: string;
        platformContext: ContextProperties;
        platformInfo: {
            product_family_code: string;
            version: string;
            guid: string;
            name: string;
            description: string;
        };
        user: string;
        userInfo: UserInfo;
    };
    export type UserInfo = {
        given_name: string;
        family_name: string;
        name: string;
        email: string;
    };
    export type RouteType = {
        route: RegExp | string;
        method: string;
    };
    export enum AuthTokenMethodEnum {
        RSA_KEY = "RSA_KEY",
        JWK_KEY = "JWK_KEY",
        JWK_SET = "JWK_SET"
    }
    export type AuthConfigType = {
        method: AuthTokenMethodEnum;
        key: string;
    };
    export type UserInfoType = any;
    export type PlatformInfoType = any;
    export class EncryptedEntity extends BaseEntity {
        iv: string;
        data: string;
    }
    export type PlatformProperties = {
        platformUrl: string;
        clientId: string;
        name: string;
        authenticationEndpoint: string;
        accessTokenEndpoint: string;
        authorizationServer?: string;
        kid: string;
        authToken: AuthConfigType;
        active?: boolean;
    };
    export type AccessTokenType = {
        access_token: string;
        token_type: string;
        expires_in: number;
        refresh_token?: string;
        scope?: string;
    };
    export type KeyObject = {
        key: string;
        kid: string;
    };
    export type LineItem = {
        id: string;
        scoreMaximum: number;
        label: string;
        resourceId?: string;
        tag: string;
        resourceLinkId?: string;
        startDateTime?: string;
        endDateTime?: string;
        gradesReleased?: false;
    };
    export type CreateLineItem = Omit<LineItem, 'id'>;
    export type getLineItemOptions = {
        resourceLinkId?: boolean;
        resourceId?: boolean;
        tag?: string | false;
        limit?: number | false;
        id?: string | false;
        label?: string | false;
        url?: string | false;
    };
    export type ScoreResultType = {
        id: string;
        scoreOf: string;
        userId: string;
        resultScore: number | null;
        resultMaximum: number;
        scoringUserId?: string;
        comment?: string;
    };
    export type ScoreType = {
        scoreGiven: number;
        scoreMaximum: number;
        comment?: string;
        activityProgress: 'Initialized' | 'Starting' | 'InProgress' | 'Submitted' | 'Completed';
        gradingProgress: 'FullyGraded' | 'Pending' | 'PendingManual' | 'Failed' | 'NotReady';
        timestamp: string;
        userId: string;
        scoringUserId?: string;
        submission?: {
            startedAt: string;
            submittedAt?: string;
        };
    };
    export type LTIK = {
        platformUrl: string;
        platformCode: string;
        clientId: string;
        deploymentId: string;
        contextId: string;
        user: string;
    };
    export type LtiAdvantageLoginParams = {
        iss: string;
        target_link_uri: string;
        client_id?: string;
        redirect_uri: string;
        login_hint: string;
        lti_message_hint: string;
        lti_deployment_id: string;
    };
    export type LtiAdvantageLoginArgs = {
        response_type: 'id_token';
        response_mode: 'form_post';
        id_token_signed_response_alg: 'RS256';
        scope: 'openid';
        client_id: string;
        redirect_uri: string;
        login_hint: string;
        nonce: string;
        prompt: 'none';
        lti_message_hint?: string;
        lti_deployment_id?: string;
        state: string;
    };
    export type LtiResourceType = 'link' | 'file' | 'html' | 'ltiResourceLink' | 'image';
    export interface BaseContentItem {
        type: LtiResourceType;
        title?: string;
        text?: string;
        custom?: Record<string, string>;
    }
    export interface IconContentItem extends BaseContentItem {
        url: string;
        icon?: string;
        thumbnail?: {
            url: string;
            width: string | number;
            height: string | number;
        };
    }
    export interface ContentItem extends IconContentItem {
        embed?: string;
        window?: {
            targetName: string;
            width: string | number;
            height: string | number;
            windowFeatures: string;
        };
        iframe?: {
            src: string;
            width: string | number;
            height: string | number;
        };
    }
    export interface LinkContentItem extends ContentItem {
        type: 'link';
    }
    export interface LtiResourceLinkContentItem extends ContentItem {
        type: 'ltiResourceLink';
        custom?: Record<string, any>;
        lineItem?: {
            label?: string;
            scoreMaximum: number;
            resourceId?: string;
            tag?: string;
            gradesReleased?: boolean;
        };
        available?: {
            startDateTime?: Date;
            endDateTime?: Date;
        };
        submission?: {
            startDateTime?: Date;
            endDateTime?: Date;
        };
    }
    export interface FileContentItem extends IconContentItem {
        type: 'file';
        expiresAt: Date;
    }
    export interface HtmlFragmentContentItem extends BaseContentItem {
        type: 'html';
        html: string;
    }
    export interface ImageContentItem extends IconContentItem {
        type: 'image';
        width?: string | number;
        height?: string | number;
    }
    export type OpenIdConfiguration = {
        issuer: string;
        authorization_endpoint: string;
        registration_endpoint: string;
        jwks_uri: string;
        token_endpoint: string;
        token_endpoint_auth_methods_supported: ['private_key_jwt'] & string[];
        token_endpoint_auth_signing_alg_values_supported: ['RS256'] & string[];
        scopes_supported: ['openid'] & string[];
        response_types_supported: ['id_token'] & string[];
        id_token_signing_alg_values_supported: ['RS256'] & string[];
        claims_supported: string[];
        subject_types_supported: ('public' | 'pairwise')[];
        authorization_server: string;
        'https://purl.imsglobal.org/spec/lti-platform-configuration': LtiPlatformConfig;
    };
    export type OpenIdRegistration = {
        application_type: 'web';
        grant_types: ['client_credentials', 'implicit'] & string[];
        response_types: ['id_token'] & string[];
        redirect_uris: string[];
        initiate_login_uri: string;
        client_name: string;
        logo_uri?: string;
        token_endpoint_auth_method: 'private_key_jwt';
        contacts?: any[];
        client_uri?: string;
        tos_uri?: string;
        policy_uri?: string;
        scope: string;
        'https://purl.imsglobal.org/spec/lti-tool-configuration': LtiPlatformRegistration;
    };
    export type ToolOpenIdConfiguration = {
        client_id: string;
        registration_client_uri?: string;
        registration_access_token?: string;
    } & OpenIdRegistration;
    export type LtiPlatformConfig = {
        product_family_code: string;
        version: string;
        messages_supported: MessageSupported[];
        variables: string[];
    };
    export type LtiPlatformRegistration = {
        domain: string;
        secondary_domains?: string[];
        deployment_id?: string;
        target_link_uri: string;
        custom_parameters?: Record<string, string>;
        description?: string;
        messages: LtiMessageRegistration[];
        claims: string[];
    };
    export type LtiMessageRegistration = {
        type: string;
        target_link_uri?: string;
        label?: string;
        icon_uri?: string;
        custom_parameters?: Record<string, string>;
        placements?: string[];
        roles?: string[];
    };
    export type LtiDeepLinkingMessageRegistration = {
        placements?: ('Content Area' | 'RichTextEditor')[];
        supported_types: LtiResourceType[];
        supported_media_types: string[];
    } & LtiMessageRegistration;
    export type MessageSupported = {
        type: string;
        placements?: string[];
    };
}
declare module "entities/access_token.entity" {
    import {EncryptedEntity} from "utils/types";
    import {PlatformModel} from "entities/platform.entity";

    export class AccessTokenModel extends EncryptedEntity {
        platformUrl: string;
        clientId: string;
        scopes: string;
        iv: string;
        data: string;
        createdAt: Date;
        expiresAt: number;
        platform: PlatformModel;
    }
}
declare module "entities/id_token.entity" {
    import {BaseEntity} from 'typeorm';
    import {PlatformInfoType, UserInfoType} from "utils/types";
    import {PlatformModel} from "entities/platform.entity";

    export class IdTokenModel extends BaseEntity {
        iss: string;
        user: string;
        userInfo: UserInfoType;
        platformInfo: PlatformInfoType;
        clientId: string;
        platformId: string;
        deploymentId: string;
        createdAt: Date;
        expiresAt: number;
        platform: PlatformModel;
    }
}
declare module "entities/key.entity" {
    import {EncryptedEntity} from "utils/types";
    import {PlatformModel} from "entities/platform.entity";

    export class KeyModel extends EncryptedEntity {
        kid: string;
        platformUrl: string;
        clientId: string;
        iv: string;
        data: string;
    }
    export class PublicKeyModel extends KeyModel {
        platform: PlatformModel;
    }
    export class PrivateKeyModel extends KeyModel {
        platform: PlatformModel;
    }
}
declare module "entities/platform.entity" {
    import {BaseEntity} from 'typeorm';
    import {AuthConfigType, AuthTokenMethodEnum} from "utils/types";
    import {AccessTokenModel} from "entities/access_token.entity";
    import {IdTokenModel} from "entities/id_token.entity";
    import {PrivateKeyModel, PublicKeyModel} from "entities/key.entity";

    export class PlatformModel extends BaseEntity {
        kid: string;
        platformUrl: string;
        clientId: string;
        name: string;
        authenticationEndpoint: string;
        accessTokenEndpoint: string;
        authorizationServer?: string;
        authTokenMethod: AuthTokenMethodEnum;
        authTokenKey: string;
        authToken(): AuthConfigType;
        active: boolean;
        accessTokens: AccessTokenModel[];
        idTokens: IdTokenModel[];
        publicKey: PublicKeyModel;
        privateKey: PrivateKeyModel;
    }
}
declare module "entities/context_token.entity" {
    import {BaseEntity} from 'typeorm';
    import {
        DeepLinkingSettings,
        IMSContext,
        IMSGradeEndpoint,
        IMSLaunchPresentation,
        IMSNamesRoles,
        IMSResourceLink,
        LISClaim
    } from "utils/types";

    export class ContextTokenModel extends BaseEntity {
        contextId: string;
        user: string;
        roles: string[];
        path: string;
        targetLinkUri: string;
        resource: IMSResourceLink;
        context?: IMSContext;
        custom?: Record<string, string>;
        launchPresentation: IMSLaunchPresentation;
        messageType: string;
        version: string;
        deepLinkingSettings?: DeepLinkingSettings;
        lis?: LISClaim;
        endpoint?: IMSGradeEndpoint;
        namesRoles?: IMSNamesRoles;
        createdAt: Date;
        expiresAt: number;
    }
}
declare module "entities/nonce.entity" {
    import {BaseEntity} from 'typeorm';

    export class NonceModel extends BaseEntity {
        nonce: string;
        createdAt: Date;
        expiresAt: number;
    }
}
declare module "entities/state.entity" {
    import {BaseEntity} from 'typeorm';

    export class StateModel extends BaseEntity {
        state: string;
        query: any;
        createdAt: Date;
        expiresAt: number;
    }
}
declare module "utils/database" {
    import {
        BaseEntity,
        DataSource,
        DataSourceOptions,
        DeepPartial,
        DeleteResult,
        EntityTarget,
        FindManyOptions,
        FindOneOptions,
        FindOptionsWhere,
        UpdateResult
    } from 'typeorm';
    import {QueryDeepPartialEntity} from 'typeorm/query-builder/QueryPartialEntity';

    export class Database {
        protected constructor();
        private static instance;
        private static encryptionKey;
        static _dataSource: DataSource;
        static get dataSource(): DataSource;
        get dataSource(): DataSource;
        private get encryptionKey();
        static initializeDatabase(options: DataSourceOptions, encryptionKey: string): Promise<Database>;
        static close(): Promise<void>;
        close(): Promise<void>;
        private decryptRecord;
        static find<T extends BaseEntity>(type: EntityTarget<T>, options?: FindManyOptions<T>): Promise<T[]>;
        find<T extends BaseEntity>(type: EntityTarget<T>, options?: FindManyOptions<T>): Promise<T[]>;
        static findOne<T extends BaseEntity>(type: EntityTarget<T>, options: FindOneOptions<T>): Promise<T | undefined>;
        findOne<T extends BaseEntity>(type: EntityTarget<T>, options: FindOneOptions<T>): Promise<T | undefined>;
        static save<T extends BaseEntity>(type: EntityTarget<T>, params: DeepPartial<T>): Promise<T>;
        save<T extends BaseEntity>(type: EntityTarget<T>, params: DeepPartial<T>): Promise<T>;
        static update<T extends BaseEntity>(type: EntityTarget<T>, params: QueryDeepPartialEntity<T>, where: FindOptionsWhere<T>): Promise<UpdateResult>;
        update<T extends BaseEntity>(type: EntityTarget<T>, params: QueryDeepPartialEntity<T>, where: FindOptionsWhere<T>): Promise<UpdateResult>;
        static delete<T extends BaseEntity>(type: EntityTarget<T>, options: FindOptionsWhere<T>): Promise<DeleteResult>;
        delete<T extends BaseEntity>(type: EntityTarget<T>, options: FindOptionsWhere<T>): Promise<DeleteResult>;
        encrypt(data: string): Promise<{
            iv: string;
            data: string;
        }>;
        decrypt(data: string, iv: string): Promise<string>;
    }
}
declare module "utils/auth" {
    import {JwtPayload} from 'jsonwebtoken';
    import {Platform} from "utils/platform";
    import {AccessTokenType, IdToken, ValidatedToken} from "utils/types";
    import {Provider} from "provider/provider";

    export class Auth {
        static generatePlatformKeyPair(kid: string, platformUrl: string, platformClientId: string): Promise<string>;
        static validateToken(provider: Provider, token: string, devMode: boolean, validationParameters: any): Promise<ValidatedToken>;
        static verifyToken(token: string, key: string, validationParameters: any, platform: Platform): Promise<ValidatedToken>;
        static oidcValidation(token: JwtPayload, platform: Platform, validationParameters: any): Promise<[boolean, boolean, boolean, boolean]>;
        static validateAud(token: JwtPayload, platform: Platform): Promise<boolean>;
        static validateAlg(alg: string): Promise<boolean>;
        static validateMaxAge(token: JwtPayload, maxAge: number): Promise<boolean>;
        static validateNonce(token: JwtPayload): Promise<boolean>;
        static claimValidation(token: IdToken): Promise<void>;
        static getAccessToken(scopes: string, platform: Platform): Promise<AccessTokenType>;
    }
}
declare module "utils/platform" {
    import {AccessTokenType, AuthConfigType, AuthTokenMethodEnum} from "utils/types";
    import {PlatformModel} from "entities/platform.entity";

    export class Platform {
        private platformModel;
        constructor(platformModel: PlatformModel);
        get platformUrl(): string;
        get clientId(): string;
        get name(): string;
        get authenticationEndpoint(): string;
        get accessTokenEndpoint(): string;
        get authorizationServer(): string;
        get kid(): string;
        get authToken(): AuthConfigType;
        get active(): boolean;
        setName(name: string): Promise<void>;
        setActive(active: boolean): Promise<void>;
        platformPublicKey(): Promise<string>;
        platformPrivateKey(): Promise<string>;
        setAuthConfig(method?: AuthTokenMethodEnum, key?: string): Promise<void>;
        setAuthenticationEndpoint(authenticationEndpoint: string): Promise<void>;
        setAccessTokenEndpoint(accessTokenEndpoint: string): Promise<void>;
        setAuthorizationServer(authorizationServer: string | null): Promise<void>;
        getAccessToken(scopes: string): Promise<AccessTokenType>;
        platformParams(): Promise<{
            kid: string;
            platformUrl: string;
            clientId: string;
            name: string;
            authenticationEndpoint: string;
            accessTokenEndpoint: string;
            authToken: AuthConfigType;
            publicKey: string;
            active: boolean;
        }>;
        delete(): Promise<this>;
        api: PlatformApi;
    }
    class PlatformApi {
        request(url: string, method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', request?: Omit<RequestInit, 'method'>, fullResponse?: boolean): Promise<any | [any, Response]>;
        get(url: string, request?: Omit<RequestInit, 'method'>, fullResponse?: boolean): Promise<any>;
        post(url: string, request?: Omit<RequestInit, 'method'>, fullResponse?: boolean): Promise<any>;
        put(url: string, request?: Omit<RequestInit, 'method'>, fullResponse?: boolean): Promise<any>;
        patch(url: string, request?: Omit<RequestInit, 'method'>, fullResponse?: boolean): Promise<any>;
        delete(url: string, request?: Omit<RequestInit, 'method'>, fullResponse?: boolean): Promise<any>;
    }
}
declare module "utils/keyset" {
    export class Keyset {
        static build(): Promise<{
            keys: any[];
        }>;
    }
}
declare module "provider/services/grade" {
    import {Provider} from "provider/provider";
    import {AccessTokenType, CreateLineItem, getLineItemOptions, IdToken, LineItem, ScoreType} from "utils/types";
    type ResultType = {
        next?: string;
        prev?: string;
        first?: string;
        last?: string;
        lineItems?: LineItem[];
        scores?: ScoreType[];
    };
    export class GradeService {
        private provider;
        constructor(provider: Provider);
        private formatResult;
        getLineItems(idToken: IdToken, options?: getLineItemOptions, accessToken?: AccessTokenType): Promise<ResultType>;
        createLineItem(idToken: IdToken, lineItem: CreateLineItem, options?: {
            resourceLinkId?: boolean;
        }, accessToken?: AccessTokenType): Promise<LineItem>;
        getLineItemById(idToken: IdToken, lineItemId: string, accessToken?: AccessTokenType): Promise<LineItem>;
        updateLineItemById(idToken: IdToken, lineItemId: string, lineItem: CreateLineItem, accessToken?: AccessTokenType): Promise<any>;
        deleteLineItemById(idToken: IdToken, lineItemId: string, accessToken?: AccessTokenType): Promise<boolean>;
        submitScore(idToken: IdToken, lineItemId: string, score: ScoreType, accessToken?: AccessTokenType): Promise<ScoreType>;
        getScores(idToken: IdToken, lineItemId: string, options?: {
            userId: string | false;
            limit: number | false;
            url: string | false;
        }, accessToken?: AccessTokenType): Promise<ResultType>;
    }
}
declare module "provider/services/deep_linking" {
    import {BaseContentItem, IdToken} from "utils/types";
    import {Provider} from "provider/provider";

    export class DeepLinkingService {
        private provider;
        constructor(provider: Provider);
        createDeepLinkingForm(idToken: IdToken, contentItems: BaseContentItem | BaseContentItem[], options: {
            message?: string;
            errMessage?: string;
            log?: string;
            errLog?: string;
        }): Promise<string>;
        createDeepLinkingMessage(idToken: IdToken, contentItems: BaseContentItem | BaseContentItem[], options: {
            message?: string;
            errMessage?: string;
            log?: string;
            errLog?: string;
        }): Promise<string>;
    }
}
declare module "provider/services/names_and_roles" {
    import {Provider} from "provider/provider";
    import {IdToken} from "utils/types";
    type MemberReturnType = {
        differences: string;
        next: string;
        members: any[];
    };
    export class NamesAndRolesService {
        private provider;
        constructor(provider: Provider);
        getMembers(idToken: IdToken, options?: {
            role?: string;
            limit?: number;
            pages?: number;
            url?: string;
            resourceLinkId?: boolean;
        }): Promise<MemberReturnType>;
    }
}
declare module "utils/objects" {
    export function isObject(item: any): boolean;
    export function deepMergeObjects(target: any, ...sources: any[]): any;
}
declare module "provider/services/dynamic_registration" {
    import {Provider} from "provider/provider";
    import {DynamicRegistrationOptions, DynamicRegistrationSecondaryOptions} from "utils/types";

    export class DynamicRegistrationService {
        private provider;
        private readonly name;
        private readonly redirectUris;
        private readonly customParameters;
        private readonly autoActivate;
        private readonly useDeepLinking;
        private readonly logo;
        private readonly description;
        private readonly hostname;
        private readonly appUrl;
        private readonly loginUrl;
        private readonly keysetUrl;
        constructor(provider: Provider, options: DynamicRegistrationOptions, routes: {
            appRoute: string;
            loginRoute: string;
            keySetRoute: string;
        });
        private buildUrl;
        private getHostname;
        register(openIdConfiguration: string, registrationToken: string, options?: DynamicRegistrationSecondaryOptions): Promise<string>;
    }
}
declare module "provider/provider" {
    import {Platform} from "utils/platform";
    import {GradeService} from "provider/services/grade";
    import {DeepLinkingService} from "provider/services/deep_linking";
    import {NamesAndRolesService} from "provider/services/names_and_roles";
    import {DynamicRegistrationService} from "provider/services/dynamic_registration";
    import {Server as HttpServer} from 'http';
    import {Server as HttpsServer} from 'https';
    import {Express, NextFunction, Request as ExpressRequest, Response as ExpressResponse} from 'express';
    import {AccessTokenType, IdToken, PlatformProperties, ProviderOptions, RouteType} from "utils/types";
    import {DataSourceOptions} from 'typeorm';
    export type Callback = (req: ExpressRequest, res: ExpressResponse, next?: NextFunction) => Promise<void | ExpressResponse> | (void | ExpressResponse);
    export type CallbackWithToken = (token: IdToken, req: ExpressRequest, res: ExpressResponse, next?: NextFunction) => Promise<void | ExpressResponse> | (void | ExpressResponse);
    export class Provider {
        private _loginRoute;
        get loginRoute(): string;
        private set loginRoute(value);
        private _appRoute;
        get appRoute(): string;
        private set appRoute(value);
        private _keySetRoute;
        get keySetRoute(): string;
        private set keySetRoute(value);
        private _dynRegRoute;
        get dynRegRoute(): string;
        private set dynRegRoute(value);
        private whitelistedRoutes;
        get whitelist(): RouteType[];
        set whitelist(routes: (string | RouteType)[]);
        private encryptionKey;
        private devMode;
        private tokenMaxAge;
        private cookieOptions;
        private isSetup;
        private server;
        private _app;
        get app(): Express;
        private set app(value);
        private _DynamicRegistration;
        get DynamicRegistration(): DynamicRegistrationService;
        private set DynamicRegistration(value);
        private _GradeService;
        get GradeService(): GradeService;
        private set GradeService(value);
        private _NamesAndRolesService;
        get NamesAndRolesService(): NamesAndRolesService;
        private set NamesAndRolesService(value);
        private _DeepLinkingService;
        get DeepLinkingService(): DeepLinkingService;
        private set DeepLinkingService(value);
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
        setup(encryptionKey: string, databaseOptions: DataSourceOptions, options: ProviderOptions): Promise<this>;
        deploy(options?: {
            port?: number;
            silent?: boolean;
            serverless?: boolean;
        }): Promise<true>;
        close(silent?: boolean): Promise<void>;
        onConnect(connectCallback: CallbackWithToken): void;
        onDeepLinking(deepLinkingCallback: CallbackWithToken): void;
        onDynamicRegistration(dynamicRegistrationCallback: Callback): void;
        onSessionTimeout(sessionTimeoutCallback: Callback): void;
        onInvalidToken(invalidTokenCallback: Callback): void;
        onUnregisteredPlatform(unregisteredPlatformCallback: Callback): void;
        onInactivePlatform(inactivePlatformCallback: Callback): void;
        registerPlatform(platform: Omit<PlatformProperties, 'kid'>): Promise<Platform>;
        getPlatform(url: string, clientId: string): Promise<Platform | undefined>;
        getPlatforms(url: string): Promise<Platform[]>;
        getPlatformById(platformId: string): Promise<Platform | undefined>;
        updatePlatformById(platformId: string, platformInfo: Partial<PlatformProperties>): Promise<Platform | undefined>;
        deletePlatform(url: string, clientId: string): Promise<Platform | undefined>;
        deletePlatformById(platformId: string): Promise<Platform | undefined>;
        getAllPlatforms(): Promise<Platform[]>;
        redirect(res: ExpressResponse, path: string, options?: {
            newResource?: boolean;
            isNewResource?: boolean;
            query?: Record<string, any>;
        }): Promise<void>;
        checkAccessToken(idToken: IdToken, scope: string, accessToken?: AccessTokenType): Promise<AccessTokenType>;
        private ltiAdvantageLogin;
    }
}
declare module "main" {
    import 'reflect-metadata';
    import {Provider as LtiProvider} from "provider/provider";
    import {DataSourceOptions} from 'typeorm';
    import {ProviderOptions} from "utils/types";
    export default function register(encryptionKey: string, databaseOptions: Omit<DataSourceOptions, 'subscribers' | 'migrations' | 'migrationsTableName' | 'migrationsTransactionMode' | 'namingStrategy' | 'logging' | 'logger'>, options: ProviderOptions): Promise<LtiProvider>;
}
