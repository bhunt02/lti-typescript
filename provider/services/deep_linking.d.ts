import { BaseContentItem, IdToken } from '../../utils/types';
import { Provider } from '../provider';
export declare class DeepLinkingService {
    private provider;
    constructor(provider: Provider);
    /**
     * @description Creates an auto submitting form containing the DeepLinking Message.
     * @param {IdToken} idToken - Idtoken for the user.
     * @param {BaseContentItem | BaseContentItem[]} contentItems - Array of contentItems to be linked.
     * @param {Object} options - Object containing extra options that mus be sent along the content items.
     * @param {String} options.message - Message the platform may show to the end user upon return to the platform.
     * @param {String} options.errMessage - Message the platform may show to the end user upon return to the platform if some error has occurred.
     * @param {String} options.log - Message the platform may log in it's system upon return to the platform.
     * @param {String} options.errLog - Message the platform may log in it's system upon return to the platform if some error has occurred.
     */
    createDeepLinkingForm(idToken: IdToken, contentItems: BaseContentItem | BaseContentItem[], options: {
        message?: string;
        errMessage?: string;
        log?: string;
        errLog?: string;
    }): Promise<string>;
    /**
     * @description Creates a DeepLinking signed message.
     * @param {Object} idToken - Idtoken for the user.
     * @param {Array} contentItems - Array of contentItems to be linked.
     * @param {Object} options - Object containing extra options that mus be sent along the content items.
     * @param {String} options.message - Message the platform may show to the end user upon return to the platform.
     * @param {String} options.errMessage - Message the platform may show to the end user upon return to the platform if some error has occurred.
     * @param {String} options.log - Message the platform may log in it's system upon return to the platform.
     * @param {String} options.errLog - Message the platform may log in it's system upon return to the platform if some error has occurred.
     */
    createDeepLinkingMessage(idToken: IdToken, contentItems: BaseContentItem | BaseContentItem[], options: {
        message?: string;
        errMessage?: string;
        log?: string;
        errLog?: string;
    }): Promise<string>;
}
