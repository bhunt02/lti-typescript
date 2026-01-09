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
    /**
     * @description Retrieves members from platform.
     * @param {Object} idToken - Idtoken for the user.
     * @param {Object} options - Request options.
     * @param {String} [options.role] - Filters based on the User role.
     * @param {Number} [options.limit] - Sets a maximum number of memberships to be returned per page.
     * @param {Number} [options.pages = 1] - Sets a maximum number of pages to be returned. Defaults to 1. If set to undefined retrieves every available page.
     * @param {String} [options.url] - Retrieve memberships from a specific URL. Usually retrieved from the `next` link header of a previous request.
     * @param {Boolean} [options.resourceLinkId = false] - If set to true, retrieves resource Link level memberships.
     */
    getMembers(idToken: IdToken, options?: {
        role?: string;
        limit?: number;
        pages?: number;
        url?: string;
        resourceLinkId?: boolean;
    }): Promise<MemberReturnType>;
}
export {};
