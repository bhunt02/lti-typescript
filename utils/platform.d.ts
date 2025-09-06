import { AccessTokenType, AuthConfigType, AuthTokenMethodEnum, KeyObject, PlatformProperties } from './types';
import { PlatformModel } from '../entities/platform.entity';
export declare class Platform {
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
    get dynamicallyRegistered(): boolean;
    get registrationEndpoint(): string | undefined;
    setName(name: string): Promise<void>;
    setActive(active: boolean): Promise<void>;
    platformPublicKey(): Promise<KeyObject>;
    platformPrivateKey(): Promise<KeyObject>;
    setAuthConfig(method?: AuthTokenMethodEnum, key?: string): Promise<void>;
    setAuthenticationEndpoint(authenticationEndpoint: string): Promise<void>;
    setAccessTokenEndpoint(accessTokenEndpoint: string): Promise<void>;
    setAuthorizationServer(authorizationServer: string | null): Promise<void>;
    getAccessToken(scopes: string): Promise<AccessTokenType>;
    platformParams(): Promise<PlatformProperties & {
        publicKey: KeyObject;
    }>;
    delete(): Promise<void>;
    api: PlatformApi;
}
declare class PlatformApi {
    request(url: string, method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', request?: Omit<RequestInit, 'method'>, fullResponse?: boolean): Promise<any | [any, Response]>;
    get(url: string, request?: Omit<RequestInit, 'method'>, fullResponse?: boolean): Promise<any>;
    post(url: string, request?: Omit<RequestInit, 'method'>, fullResponse?: boolean): Promise<any>;
    put(url: string, request?: Omit<RequestInit, 'method'>, fullResponse?: boolean): Promise<any>;
    patch(url: string, request?: Omit<RequestInit, 'method'>, fullResponse?: boolean): Promise<any>;
    delete(url: string, request?: Omit<RequestInit, 'method'>, fullResponse?: boolean): Promise<any>;
}
export {};
