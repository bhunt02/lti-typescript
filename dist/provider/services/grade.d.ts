import {Provider} from '../provider';
import {AccessTokenType, CreateLineItem, getLineItemOptions, IdToken, LineItem, ScoreType} from '../../utils/types';

type ResultType = {
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
    getLineItems(idToken: IdToken, options?: getLineItemOptions, accessToken?: AccessTokenType): Promise<ResultType>;
    createLineItem(idToken: IdToken, lineItem: CreateLineItem, options?: {
        resourceLinkId?: boolean;
    }, accessToken?: AccessTokenType): Promise<LineItem>;
    getLineItemById(idToken: IdToken, lineItemId: string, accessToken?: AccessTokenType): Promise<LineItem>;
    updateLineItemById(idToken: IdToken, lineItemId: string, lineItem: CreateLineItem, accessToken?: AccessTokenType): Promise<any>;
    deleteLineItemById(idToken: IdToken, lineItemId: string, accessToken?: AccessTokenType): Promise<boolean>;
    submitScore(idToken: IdToken, lineItemId: string, score: ScoreType, accessToken?: AccessTokenType): Promise<ScoreType>;
    getScores(idToken: IdToken, lineItemId: string, options?: {
        userId: string | false;
        limit: number | false;
        url: string | false;
    }, accessToken?: AccessTokenType): Promise<ResultType>;
}
export {};
