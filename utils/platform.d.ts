import { AccessTokenType, AuthConfigType, AuthTokenMethodEnum, KeyObject, PlatformProperties } from './types';
import { PlatformModel } from '../entities/platform.entity';
import { AxiosRequestConfig } from 'axios';
/**
 * @description Class representing a registered platform.
 */
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
    get productFamilyCode(): string | undefined;
    get registrationEndpoint(): string | undefined;
    get scopesSupported(): string[] | undefined;
    /**
     * @description Sets/Gets the platform name.
     * @param {string} name - Platform name.
     */
    setName(name: string): Promise<void>;
    /**
     * @description Sets the platform status.
     * @param {Boolean} active Whether the Platform is active or not.
     */
    setActive(active: boolean): Promise<void>;
    /**
     * @description Gets the RSA public key assigned to the platform.
     *
     */
    platformPublicKey(): Promise<KeyObject>;
    /**
     * @description Gets the RSA private key assigned to the platform.
     *
     */
    platformPrivateKey(): Promise<KeyObject>;
    /**
     * @description Sets the platform authorization configurations used to validate it's messages.
     * @param {string} method Method of authorization "RSA_KEY" or "JWK_KEY" or "JWK_SET".
     * @param {string} key Either the RSA public key provided by the platform, or the JWK key, or the JWK keyset address.
     */
    setAuthConfig(method?: AuthTokenMethodEnum, key?: string): Promise<void>;
    /**
     * @description Sets the platform authorization endpoint used to perform the OIDC login.
     * @param {string} authenticationEndpoint Platform authentication endpoint.
     */
    setAuthenticationEndpoint(authenticationEndpoint: string): Promise<void>;
    /**
     * @description Sets the platform access token endpoint used to authenticate messages to the platform.
     * @param {string} accessTokenEndpoint Platform access token endpoint.
     */
    setAccessTokenEndpoint(accessTokenEndpoint: string): Promise<void>;
    /**
     * @description Sets the platform authorization server endpoint used to authenticate messages to the platform.
     * @param {string} authorizationServer Platform authorization server endpoint.
     */
    setAuthorizationServer(authorizationServer: string | null): Promise<void>;
    /**
     * @description Gets the platform access token or attempts to generate a new one.
     * @param {String} scopes - String of scopes.
     */
    getAccessToken(scopes: string): Promise<AccessTokenType>;
    /**
     * @description Retrieves the platform information as a JSON object.
     */
    platformParams(): Promise<PlatformProperties & {
        publicKey: KeyObject;
    }>;
    /**
     * @description Deletes a registered platform.
     */
    delete(): Promise<void>;
    api: PlatformApi;
}
declare class PlatformApi {
    /**
     * @description Makes an HTTP DELETE request to the platform.
     * @param url - The URL to make the request to
     * @param method - The method to use for the request (e.g., 'GET')
     * @param request - RequestInit properties (e.g., body)
     * @param fullResponse - (Optional) Return full response object
     */
    request(url: string, method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', request?: Omit<AxiosRequestConfig, 'method' | 'url'>, fullResponse?: boolean): Promise<any | [any, Response]>;
    /**
     * @description Makes an HTTP DELETE request to the platform.
     * @param url - The URL to make the request to
     * @param request - RequestInit properties (e.g., body)
     * @param fullResponse - (Optional) Return full response object
     */
    get(url: string, request?: Omit<AxiosRequestConfig, 'method' | 'url'>, fullResponse?: boolean): Promise<any>;
    /**
     * @description Makes an HTTP DELETE request to the platform.
     * @param url - The URL to make the request to
     * @param request - RequestInit properties (e.g., body)
     * @param fullResponse - (Optional) Return full response object
     */
    post(url: string, request?: Omit<AxiosRequestConfig, 'method' | 'url'>, fullResponse?: boolean): Promise<any>;
    /**
     * @description Makes an HTTP PUT request to the platform.
     * @param url - The URL to make the request to
     * @param request - RequestInit properties (e.g., body)
     * @param fullResponse - (Optional) Return full response object
     */
    put(url: string, request?: Omit<AxiosRequestConfig, 'method' | 'url'>, fullResponse?: boolean): Promise<any>;
    /**
     * @description Makes an HTTP DELETE request to the platform.
     * @param url - The URL to make the request to
     * @param request - RequestInit properties (e.g., body)
     * @param fullResponse - (Optional) Return full response object
     */
    patch(url: string, request?: Omit<AxiosRequestConfig, 'method' | 'url'>, fullResponse?: boolean): Promise<any>;
    /**
     * @description Makes an HTTP DELETE request to the platform.
     * @param url - The URL to make the request to
     * @param request - RequestInit properties (e.g., body)
     * @param fullResponse - (Optional) Return full response object
     */
    delete(url: string, request?: Omit<AxiosRequestConfig, 'method' | 'url'>, fullResponse?: boolean): Promise<any>;
}
export {};
