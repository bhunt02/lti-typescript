"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NamesAndRolesService = void 0;
const parseLink = require("parse-link-header");
const debug_1 = require("../../utils/debug");
class NamesAndRolesService {
    constructor(provider) {
        this.provider = provider;
    }
    async getMembers(idToken, options = { pages: 1, resourceLinkId: false }) {
        if (!idToken) {
            debug_1.Debug.log(this, 'Missing IdToken object.');
            throw new Error('MISSING_ID_TOKEN');
        }
        debug_1.Debug.log(this, 'Attempting to retrieve memberships');
        debug_1.Debug.log(this, 'Target platform: ' + idToken.iss);
        const accessToken = await this.provider.checkAccessToken(idToken, 'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly');
        const platform = await this.provider.getPlatformById(idToken.platformId);
        let pages = 1;
        let query = new URLSearchParams();
        let next = idToken.platformContext.namesRoles.context_memberships_url;
        if (options) {
            if (options.pages !== undefined) {
                debug_1.Debug.log(this, 'Maximum number of pages retrieved: ' + options.pages);
                pages = options.pages;
            }
            if (options.url) {
                next = options.url;
                query = undefined;
            }
            else {
                if (options.role) {
                    debug_1.Debug.log(this, 'Adding role parameter with value: ' + options.role);
                    query.append('role', options.role);
                }
                if (options.limit) {
                    debug_1.Debug.log(this, 'Adding limit parameter with value: ' + options.limit);
                    query.append('limit', String(options.limit));
                }
                if (options.resourceLinkId) {
                    debug_1.Debug.log(this, 'Adding rlid parameter with value: ' +
                        idToken.platformContext.resource.id);
                    query.append('rlid', idToken.platformContext.resource.id);
                }
            }
        }
        let differences;
        let result;
        let curPage = 1;
        do {
            if (pages && curPage > pages) {
                if (next)
                    result.next = next;
                break;
            }
            let response;
            debug_1.Debug.log(this, 'Member pages found: ', curPage);
            debug_1.Debug.log(this, 'Current member page: ', next);
            if (query && curPage === 1) {
                response = await platform.api.get(`${next}${query.size > 0 ? `?${query.toString()}` : ''}`, {
                    headers: {
                        Authorization: accessToken.token_type + ' ' + accessToken.access_token,
                        Accept: 'application/vnd.ims.lti-nrps.v2.membershipcontainer+json',
                    },
                }, true);
            }
            else {
                response = await platform.api.get(next, {
                    headers: {
                        Authorization: accessToken.token_type + ' ' + accessToken.access_token,
                        Accept: 'application/vnd.ims.lti-nrps.v2.membershipcontainer+json',
                    },
                }, true);
            }
            const body = response[0]
                ? JSON.parse(JSON.stringify(response[0]))
                : undefined;
            if (body) {
                if (!result) {
                    result = body;
                }
                else {
                    result.members = [...result.members, ...body?.members];
                }
            }
            const parsedLinks = response[1].headers?.get('link')
                ? parseLink(response[1].headers.get('link'))
                : undefined;
            if (parsedLinks && parsedLinks.differences) {
                differences = parsedLinks.differences.url;
            }
            if (parsedLinks && parsedLinks.next) {
                next = parsedLinks.next.url;
            }
            else {
                next = undefined;
            }
            curPage++;
        } while (next);
        if (differences)
            result.differences = differences;
        debug_1.Debug.log(this, 'Memberships retrieved');
        return result;
    }
}
exports.NamesAndRolesService = NamesAndRolesService;
//# sourceMappingURL=names_and_roles.js.map