import { Provider } from '../provider';
import { AccessTokenType, DynamicRegistrationOptions, DynamicRegistrationSecondaryOptions } from '../../utils/types';
import { Platform } from "../../utils/platform";
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
    register(openIdConfiguration: string, registrationToken: string, options?: DynamicRegistrationSecondaryOptions): Promise<string>;
    getRegistration(platform: Platform, accessToken?: AccessTokenType): Promise<any>;
    updateRegistration(platform: Platform, options?: DynamicRegistrationSecondaryOptions): Promise<any>;
}
