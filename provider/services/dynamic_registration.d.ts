import { Provider } from '../provider';
import { AccessTokenType, DynamicRegistrationOptions, DynamicRegistrationSecondaryOptions } from '../../utils/types';
import { Platform } from '../../utils/platform';
export declare class DynamicRegistrationService {
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
    /**
     * @description Performs dynamic registration flow.
     * @param {String} openIdConfiguration - OpenID configuration URL. Retrieved from req.query.openid_configuration.
     * @param {String} registrationToken - Registration Token. Retrieved from req.query.registration_token.
     * @param {DynamicRegistrationSecondaryOptions} [options] - Replacements or extensions to default registration options.
     */
    register(openIdConfiguration: string, registrationToken: string, options?: DynamicRegistrationSecondaryOptions): Promise<string>;
    /**
     * @description Attempts to retrieve an existing dynamic registration.
     * @param {Platform} platform The platform for which to retrieve a dynamic registration.
     * @param {AccessTokenType} accessToken Optionally passed access token to be used in fetching information.
     */
    getRegistration(platform: Platform, accessToken?: AccessTokenType): Promise<any>;
    /**
     * @description Performs a dynamic registration update.
     * @param platform The platform to be updated.
     * @param {DynamicRegistrationSecondaryOptions} [options] - Replacements or extensions to default registration options.
     */
    updateRegistration(platform: Platform, options?: DynamicRegistrationSecondaryOptions): Promise<any>;
}
