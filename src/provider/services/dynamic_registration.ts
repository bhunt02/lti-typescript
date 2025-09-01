/* Provider Dynamic Registration Service */
import * as crypto from 'crypto';
import * as Url from 'fast-url-parser';
import {deepMergeObjects} from '../../utils/objects';
import {Database} from '../../utils/database';
import {PlatformModel} from '../../entities/platform.entity';
import {Debug} from '../../utils/debug';
import {Provider} from '../provider';
import {
  AuthTokenMethodEnum,
  DynamicRegistrationOptions,
  DynamicRegistrationSecondaryOptions,
  OpenIdConfiguration,
  OpenIdRegistration,
  ToolOpenIdConfiguration,
} from '../../utils/types';

export class DynamicRegistrationService {
  private readonly name: string;
  private readonly redirectUris: string[];
  private readonly customParameters: Record<string, any>;
  private readonly autoActivate: boolean;
  private readonly useDeepLinking: boolean;
  private readonly logo: string;
  private readonly description: string;
  private readonly hostname: string;

  private readonly appUrl: string;
  private readonly loginUrl: string;
  private readonly keysetUrl: string;

  constructor(
    private provider: Provider,
    options: DynamicRegistrationOptions,
    routes: { appRoute: string; loginRoute: string; keySetRoute: string },
  ) {
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
  private buildUrl(url: string, path: string) {
    if (path === '/') return url;
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
  private getHostname(url: string) {
    const pathParts = Url.parse(url);
    let hostname = pathParts.hostname;
    if (pathParts.port) hostname += ':' + pathParts.port;
    return hostname;
  }

  /**
   * @description Performs dynamic registration flow.
   * @param {String} openIdConfiguration - OpenID configuration URL. Retrieved from req.query.openid_configuration.
   * @param {String} registrationToken - Registration Token. Retrieved from req.query.registration_token.
   * @param {Partial<DynamicRegistrationOptions> & Partial<DynamicRegistrationSecondaryOptions>} [options] - Replacements or extensions to default registration options.
   */
  async register(
    openIdConfiguration: string,
    registrationToken: string,
    options?: DynamicRegistrationSecondaryOptions,
  ) {
    if (!openIdConfiguration) throw new Error('MISSING_OPENID_CONFIGURATION');
    Debug.log(this, 'Starting dynamic registration process');
    // Get Platform registration configurations
    const configuration: OpenIdConfiguration = await fetch(
      openIdConfiguration,
      {
        method: 'GET',
      },
    )
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

    Debug.log(this, 'OpenID Configuration: ', JSON.stringify(configuration));
    Debug.log(
      this,
      'Attempting to register Platform with issuer: ',
      configuration.issuer,
    );
    // Building registration object
    const messages = [{ type: 'LtiResourceLinkRequest' }];
    if (this.useDeepLinking) messages.push({ type: 'LtiDeepLinkingRequest' });
    const registration = deepMergeObjects(
      {
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
      } as OpenIdRegistration,
      options,
    );
    Debug.log(
      this,
      `Tool registration request: ${JSON.stringify(registration)}`,
    );
    Debug.log(this, 'Sending Tool registration request');
    const registrationResponse: ToolOpenIdConfiguration = await fetch(
      configuration.registration_endpoint,
      {
        method: 'POST',
        body: JSON.stringify(registration),
        headers: {
          'Content-Type': 'application/json',
          ...(registrationToken
            ? { Authorization: 'Bearer ' + registrationToken }
            : undefined),
        },
      },
    )
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

    // Registering Platform
    const platformName =
      (configuration[
        'https://purl.imsglobal.org/spec/lti-platform-configuration'
      ]
        ? configuration[
            'https://purl.imsglobal.org/spec/lti-platform-configuration'
          ].product_family_code
        : 'Platform') +
      '_DynReg_' +
      crypto.randomBytes(16).toString('hex');

    if (
      await this.provider.getPlatform(
        configuration.issuer,
        registrationResponse.client_id,
      )
    )
      throw new Error('PLATFORM_ALREADY_REGISTERED');

    Debug.log(this, 'Registering Platform');
    const registered = await this.provider.registerPlatform({
      platformUrl: configuration.issuer,
      name: platformName,
      clientId: registrationResponse.client_id,
      authenticationEndpoint: configuration.authorization_endpoint,
      accessTokenEndpoint: configuration.token_endpoint,
      authorizationServer: configuration.authorization_server,
      authToken: {
        method: AuthTokenMethodEnum.JWK_SET,
        key: configuration.jwks_uri,
      },
      active: this.autoActivate,
    });
    await Database.update(
      PlatformModel,
      { active: this.autoActivate },
      { kid: registered.kid },
    );

    // Returing message indicating the end of registration flow
    return '<script>(window.opener || window.parent).postMessage({subject:"org.imsglobal.lti.close"}, "*");</script>';
  }
}
