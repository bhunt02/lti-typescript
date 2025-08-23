import {Provider} from '../provider';
import {DynamicRegistrationOptions, DynamicRegistrationSecondaryOptions} from '../../utils/types';

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
}
