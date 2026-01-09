import { Provider } from '../provider';
import { AccessTokenType, CreateLineItem, getLineItemOptions, IdToken, LineItem, ScoreType } from '../../utils/types';
export type LinkType = {
    url: string;
};
export type ParsedLinkType = {
    next?: LinkType;
    prev?: LinkType;
    first?: LinkType;
    last?: LinkType;
};
export type ResultType = {
    next?: string;
    prev?: string;
    first?: string;
    last?: string;
    lineItems?: LineItem[];
    scores?: ScoreType[];
};
export declare class GradeService {
    private provider;
    constructor(provider: Provider);
    private formatResult;
    /**
     * @description Gets lineitems from a given platform
     * @param {Object} idToken - Idtoken for the user
     * @param {Object} [options] - Options object
     * @param {Boolean} [options.resourceLinkId = false] - Filters line items based on the resourceLinkId of the resource that originated the request
     * @param {String} [options.resourceId = false] - Filters line items based on the resourceId
     * @param {String} [options.tag = false] - Filters line items based on the tag
     * @param {Number} [options.limit = false] - Sets a maximum number of line items to be returned
     * @param {String} [options.id = false] - Filters line items based on the id
     * @param {String} [options.label = false] - Filters line items based on the label
     * @param {String} [options.url = false] - Retrieves line items from a specific URL. Usually retrieved from the `next` link header of a previous request.
     * @param {AccessTokenType} accessToken
     */
    getLineItems(idToken: IdToken, options?: getLineItemOptions, accessToken?: AccessTokenType): Promise<ResultType>;
    /**
     * @description Creates a new lineItem for the given context
     * @param {IdToken} idToken - Idtoken for the user
     * @param {LineItem} lineItem - LineItem Object, following the application/vnd.ims.lis.v2.lineitem+json specification
     * @param {Object} [options] - Aditional configuration for the lineItem
     * @param {Boolean} [options.resourceLinkId = false] - If set to true, binds the created lineItem to the resource that originated the request
     * @param {AccessTokenType} accessToken
     */
    createLineItem(idToken: IdToken, lineItem: CreateLineItem, options?: {
        resourceLinkId?: boolean;
    }, accessToken?: AccessTokenType): Promise<LineItem>;
    /**
     * @description Gets LineItem by the ID
     * @param {Object} idToken - Idtoken for the user
     * @param {String} lineItemId - LineItem ID.
     * @param {AccessTokenType} accessToken Optionally passed access token if already acquired
     */
    getLineItemById(idToken: IdToken, lineItemId: string, accessToken?: AccessTokenType): Promise<LineItem>;
    /**
     * @description Updates LineItem by the ID
     * @param {Object} idToken - Idtoken for the user
     * @param {String} lineItemId - LineItem ID.
     * @param {Object} lineItem - Updated fields.
     * @param {AccessTokenType} accessToken Optionally passed access token if already acquired
     */
    updateLineItemById(idToken: IdToken, lineItemId: string, lineItem: CreateLineItem, accessToken?: AccessTokenType): Promise<LineItem>;
    /**
     * @description Deletes LineItem by the ID
     * @param {Object} idToken - Idtoken for the user
     * @param {String} lineItemId - LineItem ID.
     * @param {AccessTokenType} accessToken Optionally passed access token if already acquired
     */
    deleteLineItemById(idToken: IdToken, lineItemId: string, accessToken?: AccessTokenType): Promise<boolean>;
    /**
     * @description Publishes a score or grade to a lineItem. Represents the Score Publish service described in the lti 1.3 specification.
     * @param {IdToken} idToken - Idtoken for the user.
     * @param {String} lineItemId - LineItem ID.
     * @param {Omit<ScoreType,'timestamp'>} score - Score/Grade following the LTI Standard application/vnd.ims.lis.v1.score+json.
     * @param {AccessTokenType} accessToken Optionally passed access token if already acquired
     */
    submitScore(idToken: IdToken, lineItemId: string, score: Omit<ScoreType, 'timestamp'>, accessToken?: AccessTokenType): Promise<ScoreType>;
    /**
     * @description Retrieves scores from a lineItem. Represents the Result service described in the lti 1.3 specification.
     * @param {IdToken} idToken - Idtoken for the user.
     * @param {String} lineItemId - LineItem ID.
     * @param {Object} [options] - Options object.
     * @param {String} [options.userId = false] - Filters based on the userId.
     * @param {Number} [options.limit = false] - Sets a maximum number of scores to be returned.
     * @param {String} [options.url = false] - Retrieves scores from a specific URL. Usually retrieved from the `next` link header of a previous request.
     * @param {AccessTokenType} accessToken Optionally passed access token if already acquired
     */
    getScores(idToken: IdToken, lineItemId: string, options?: {
        userId: string | false;
        limit: number | false;
        url: string | false;
    }, accessToken?: AccessTokenType): Promise<ResultType>;
}
