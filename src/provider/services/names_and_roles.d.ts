import { Provider } from '../provider';
import { IdToken } from '../../utils/types';
type MemberReturnType = {
    differences: string;
    next: string;
    members: any[];
};
export declare class NamesAndRolesService {
    private provider;
    constructor(provider: Provider);
    getMembers(idToken: IdToken, options?: {
        role?: string;
        limit?: number;
        pages?: number;
        url?: string;
        resourceLinkId?: boolean;
    }): Promise<MemberReturnType>;
}
export {};
