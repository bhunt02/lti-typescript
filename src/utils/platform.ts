import {AccessTokenType, AuthConfigType, AuthTokenMethodEnum, KeyObject, PlatformProperties} from './types';
import {PlatformModel} from '../entities/platform.entity';
import {Database} from './database';
import {PrivateKeyModel, PublicKeyModel} from '../entities/key.entity';
import {AccessTokenModel} from '../entities/access_token.entity';
import {Auth} from './auth';
import {Debug} from './debug';

/**
 * @description Class representing a registered platform.
 */
export class Platform {
  constructor(private platformModel: PlatformModel) {}

  get platformUrl(): string {
    return this.platformModel.platformUrl;
  }
  get clientId(): string {
    return this.platformModel.clientId;
  }
  get name(): string {
    return this.platformModel.name;
  }
  get authenticationEndpoint(): string {
    return this.platformModel.authenticationEndpoint;
  }
  get accessTokenEndpoint(): string {
    return this.platformModel.accessTokenEndpoint;
  }
  get authorizationServer(): string {
    return (
      this.platformModel.authorizationServer ??
      this.platformModel.accessTokenEndpoint
    );
  }
  get kid(): string {
    return this.platformModel.kid;
  }
  get authToken(): AuthConfigType {
    return this.platformModel.authToken();
  }
  get active(): boolean {
    return this.platformModel.active;
  }
  get dynamicallyRegistered(): boolean {
    return this.platformModel.dynamicallyRegistered;
  }
  get productFamilyCode(): string | undefined {
    return this.platformModel.productFamilyCode;
  }
  get registrationEndpoint(): string | undefined {
    return this.platformModel.registrationEndpoint;
  }
  get scopesSupported(): string[] | undefined {
    return this.platformModel.scopesSupported;
  }

  /**
   * @description Sets/Gets the platform name.
   * @param {string} name - Platform name.
   */
  async setName(name: string): Promise<void> {
    await Database.update(
      PlatformModel,
      {
        name,
      },
      {
        platformUrl: this.platformUrl,
        clientId: this.clientId,
      },
    );
    await this.platformModel.reload();
  }
  /**
   * @description Sets the platform status.
   * @param {Boolean} active Whether the Platform is active or not.
   */
  async setActive(active: boolean): Promise<void> {
    await Database.update(
      PlatformModel,
      {
        active,
      },
      {
        platformUrl: this.platformUrl,
        clientId: this.clientId,
      },
    );
    await this.platformModel.reload();
  }

  /**
   * @description Gets the RSA public key assigned to the platform.
   *
   */
  async platformPublicKey(): Promise<KeyObject> {
    const key = await Database.findOne(PublicKeyModel, {
      where: { kid: this.kid },
    });
    return key.data as unknown as KeyObject;
  }

  /**
   * @description Gets the RSA private key assigned to the platform.
   *
   */
  async platformPrivateKey(): Promise<KeyObject> {
    const key = await Database.findOne(PrivateKeyModel, {
      where: { kid: this.kid },
    });
    return key.data as unknown as KeyObject;
  }

  /**
   * @description Sets the platform authorization configurations used to validate it's messages.
   * @param {string} method Method of authorization "RSA_KEY" or "JWK_KEY" or "JWK_SET".
   * @param {string} key Either the RSA public key provided by the platform, or the JWK key, or the JWK keyset address.
   */
  async setAuthConfig(method?: AuthTokenMethodEnum, key?: string): Promise<void> {
    await Database.update(
      PlatformModel,
      {
        authTokenMethod: method || this.authToken.method,
        authTokenKey: key || this.authToken.key,
      },
      {
        platformUrl: this.platformUrl,
        clientId: this.clientId,
      },
    );
    await this.platformModel.reload();
  }

  /**
   * @description Sets the platform authorization endpoint used to perform the OIDC login.
   * @param {string} authenticationEndpoint Platform authentication endpoint.
   */
  async setAuthenticationEndpoint(authenticationEndpoint: string): Promise<void> {
    await Database.update(
      PlatformModel,
      {
        authenticationEndpoint,
      },
      {
        platformUrl: this.platformUrl,
        clientId: this.clientId,
      },
    );
    await this.platformModel.reload();
  }

  /**
   * @description Sets the platform access token endpoint used to authenticate messages to the platform.
   * @param {string} accessTokenEndpoint Platform access token endpoint.
   */
  async setAccessTokenEndpoint(accessTokenEndpoint: string): Promise<void> {
    await Database.update(
      PlatformModel,
      {
        accessTokenEndpoint,
      },
      {
        platformUrl: this.platformUrl,
        clientId: this.clientId,
      },
    );
    await this.platformModel.reload();
  }

  /**
   * @description Sets the platform authorization server endpoint used to authenticate messages to the platform.
   * @param {string} authorizationServer Platform authorization server endpoint.
   */
  async setAuthorizationServer(authorizationServer: string | null): Promise<void> {
    await Database.update(
      PlatformModel,
      {
        authorizationServer,
      },
      {
        platformUrl: this.platformUrl,
        clientId: this.clientId,
      },
    );
    await this.platformModel.reload();
  }

  /**
   * @description Gets the platform access token or attempts to generate a new one.
   * @param {String} scopes - String of scopes.
   */
  async getAccessToken(scopes: string): Promise<AccessTokenType> {
    if (this.scopesSupported) {
      scopes.split(' ').forEach((scope) => {
        if (!this.scopesSupported.some(s => s == scope)) {
          throw new Error('SCOPE_UNSUPPORTED');
        }
      });
    }
    const existingToken = await Database.findOne(AccessTokenModel, {
      where: { platformUrl: this.platformUrl, clientId: this.clientId, scopes },
    });
    let token: AccessTokenType;
    const expired =
      existingToken &&
      (Date.now() - existingToken.createdAt.getTime()) / 1000 >
        existingToken.expiresAt;
    if (!existingToken || expired) {
      Debug.log(
        this,
        'Valid access_token for ' + this.platformUrl + ' not found',
      );
      Debug.log(
        this,
        'Attempting to generate new access_token for ' + this.platformUrl,
      );
      Debug.log(this, 'With scopes: ' + scopes);
      token = await Auth.getAccessToken(scopes, this);
    } else {
      Debug.log(this, 'Access_token found');
      token = existingToken.data as unknown as AccessTokenType;
    }
    token.token_type =
      token.token_type.charAt(0).toUpperCase() + token.token_type.slice(1);
    return token;
  }

  /**
   * @description Retrieves the platform information as a JSON object.
   */
  async platformParams(): Promise<PlatformProperties & { publicKey: KeyObject }> {
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

  /**
   * @description Deletes a registered platform.
   */
  async delete(): Promise<void> {
    await Database.delete(PublicKeyModel, { kid: this.kid });
    await Database.delete(PrivateKeyModel, { kid: this.kid });
    await Database.delete(PlatformModel, {
      kid: this.kid,
    });
  }

  api: PlatformApi = new PlatformApi();
}

class PlatformApi {
  /**
   * @description Makes an HTTP DELETE request to the platform.
   * @param url - The URL to make the request to
   * @param method - The method to use for the request (e.g., 'GET')
   * @param request - RequestInit properties (e.g., body)
   * @param fullResponse - (Optional) Return full response object
   */
  async request(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    request?: Omit<RequestInit, 'method'>,
    fullResponse = false,
  ): Promise<any | [any, Response]> {
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

  /**
   * @description Makes an HTTP DELETE request to the platform.
   * @param url - The URL to make the request to
   * @param request - RequestInit properties (e.g., body)
   * @param fullResponse - (Optional) Return full response object
   */
  async get(
    url: string,
    request?: Omit<RequestInit, 'method'>,
    fullResponse = false,
  ) {
    return await this.request(url, 'GET', request, fullResponse);
  }

  /**
   * @description Makes an HTTP DELETE request to the platform.
   * @param url - The URL to make the request to
   * @param request - RequestInit properties (e.g., body)
   * @param fullResponse - (Optional) Return full response object
   */
  async post(
    url: string,
    request?: Omit<RequestInit, 'method'>,
    fullResponse = false,
  ) {
    return await this.request(url, 'POST', request, fullResponse);
  }

  /**
   * @description Makes an HTTP PUT request to the platform.
   * @param url - The URL to make the request to
   * @param request - RequestInit properties (e.g., body)
   * @param fullResponse - (Optional) Return full response object
   */
  async put(
    url: string,
    request?: Omit<RequestInit, 'method'>,
    fullResponse = false,
  ) {
    return await this.request(url, 'PUT', request, fullResponse);
  }

  /**
   * @description Makes an HTTP DELETE request to the platform.
   * @param url - The URL to make the request to
   * @param request - RequestInit properties (e.g., body)
   * @param fullResponse - (Optional) Return full response object
   */
  async patch(
    url: string,
    request?: Omit<RequestInit, 'method'>,
    fullResponse = false,
  ) {
    return await this.request(url, 'PATCH', request, fullResponse);
  }

  /**
   * @description Makes an HTTP DELETE request to the platform.
   * @param url - The URL to make the request to
   * @param request - RequestInit properties (e.g., body)
   * @param fullResponse - (Optional) Return full response object
   */
  async delete(
    url: string,
    request?: Omit<RequestInit, 'method'>,
    fullResponse = false,
  ) {
    return await this.request(url, 'DELETE', request, fullResponse);
  }
}
