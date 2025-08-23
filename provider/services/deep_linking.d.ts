import { BaseContentItem, IdToken } from '../../utils/types';
import { Provider } from '../provider';
export declare class DeepLinkingService {
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
