/* Names and Roles Provisioning Service */

import * as parseLink from 'parse-link-header';
import {Debug} from '../../utils/debug';
import {Provider} from '../provider';
import {IdToken} from '../../utils/types';

type MemberReturnType = {
  differences: string;
  next: string;
  members: any[];
};

export class NamesAndRolesService {
  constructor(private provider: Provider) {}

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
  async getMembers(
    idToken: IdToken,
    options: {
      role?: string;
      limit?: number;
      pages?: number;
      url?: string;
      resourceLinkId?: boolean;
    } = { pages: 1, resourceLinkId: false },
  ): Promise<MemberReturnType> {
    if (!idToken) {
      Debug.log(this, 'Missing IdToken object.');
      throw new Error('MISSING_ID_TOKEN');
    }
    Debug.log(this, 'Attempting to retrieve memberships');
    Debug.log(this, 'Target platform: ' + idToken.iss);

    const accessToken = await this.provider.checkAccessToken(
      idToken,
      'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly',
    );
    const platform = await this.provider.getPlatformById(idToken.platformId);

    let pages = 1; // Page limit
    let query = new URLSearchParams();

    let next = idToken.platformContext.namesRoles.context_memberships_url;
    if (options) {
      if (options.pages !== undefined) {
        Debug.log(this, 'Maximum number of pages retrieved: ' + options.pages);
        pages = options.pages;
      }
      if (options.url) {
        next = options.url;
        query = undefined;
      } else {
        if (options.role) {
          Debug.log(this, 'Adding role parameter with value: ' + options.role);
          query.append('role', options.role);
        }
        if (options.limit) {
          Debug.log(
            this,
            'Adding limit parameter with value: ' + options.limit,
          );
          query.append('limit', String(options.limit));
        }
        if (options.resourceLinkId) {
          Debug.log(
            this,
            'Adding rlid parameter with value: ' +
              idToken.platformContext.resource.id,
          );
          query.append('rlid', idToken.platformContext.resource.id);
        }
      }
    }

    let differences: string;
    let result: MemberReturnType;
    let curPage = 1;

    do {
      if (pages && curPage > pages) {
        if (next) result.next = next;
        break;
      }
      let response: [any, Response];
      Debug.log(this, 'Member pages found: ', curPage);
      Debug.log(this, 'Current member page: ', next);

      if (query && curPage === 1) {
        response = await platform.api.get(
          `${next}${query.size > 0 ? `?${query.toString()}` : ''}`,
          {
            headers: {
              Authorization:
                accessToken.token_type + ' ' + accessToken.access_token,
              Accept:
                'application/vnd.ims.lti-nrps.v2.membershipcontainer+json',
            },
          },
          true,
        );
      } else {
        response = await platform.api.get(
          next,
          {
            headers: {
              Authorization:
                accessToken.token_type + ' ' + accessToken.access_token,
              Accept:
                'application/vnd.ims.lti-nrps.v2.membershipcontainer+json',
            },
          },
          true,
        );
      }

      const body = response[0]
        ? JSON.parse(JSON.stringify(response[0]))
        : undefined;

      if (body) {
        if (!result) {
          result = body;
        } else {
          result.members = [...result.members, ...body?.members];
        }
      }

      const parsedLinks = response[1].headers?.get('link')
        ? parseLink(response[1].headers.get('link'))
        : undefined;
      // Trying to find "rel=differences" header
      if (parsedLinks && parsedLinks.differences) {
        differences = parsedLinks.differences.url;
      }
      // Trying to find "rel=next" header, indicating additional pages
      if (parsedLinks && parsedLinks.next) {
        next = parsedLinks.next.url;
      } else {
        next = undefined;
      }
      curPage++;
    } while (next);

    if (differences) result.differences = differences;
    Debug.log(this, 'Memberships retrieved');
    return result;
  }
}
