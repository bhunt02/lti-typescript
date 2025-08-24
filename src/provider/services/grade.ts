/* Provider Assignment and Grade Service */

import * as parseLink from 'parse-link-header';
import {Debug} from '../../utils/debug';
import {Provider} from '../provider';
import {AccessTokenType, CreateLineItem, getLineItemOptions, IdToken, LineItem, ScoreType,} from '../../utils/types';

export type LinkType = { url: string };
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

export class GradeService {
  constructor(private provider: Provider) {}

  private formatResult(
    parsedLinks: ParsedLinkType,
    lineItems?: LineItem[],
    scores?: ScoreType[],
  ): ResultType {
    return {
      next: parsedLinks?.next?.url,
      prev: parsedLinks?.prev?.url,
      first: parsedLinks?.first?.url,
      last: parsedLinks?.last?.url,
      lineItems,
      scores,
    };
  }

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
  async getLineItems(
    idToken: IdToken,
    options?: getLineItemOptions,
    accessToken?: AccessTokenType,
  ): Promise<ResultType> {
    if (!idToken) {
      Debug.log(this, 'Missing IdToken object.');
      throw new Error('MISSING_ID_TOKEN');
    }
    Debug.log(this, 'Target platform: ' + idToken.iss);

    accessToken = await this.provider.checkAccessToken(
      idToken,
      'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly',
      accessToken,
    );
    const platform = await this.provider.getPlatformById(idToken.platformId);

    let response: [any, Response];

    if (options && options.url) {
      Debug.log(this, 'Requesting line items from: ' + options.url);
      response = await platform.api.get(
        options.url,
        {
          headers: {
            Authorization:
              accessToken.token_type + ' ' + accessToken.access_token,
            Accept: 'application/vnd.ims.lis.v2.lineitemcontainer+json',
          },
        },
        true,
      );
    } else {
      let lineitemsEndpoint = idToken.platformContext.endpoint.lineitems;
      let query = new URLSearchParams();
      if (lineitemsEndpoint.indexOf('?') !== -1) {
        query = new URLSearchParams(lineitemsEndpoint.split('\?')[1]);
        lineitemsEndpoint = lineitemsEndpoint.split('\?')[0];
      }

      if (options) {
        if (options.resourceLinkId)
          query.append('resource_link_id', idToken.platformContext.resource.id);
        if (options.limit && !options.id && !options.label)
          query.append('limit', String(options.limit));
        if (options.tag) query.append('tag', options.tag);
        if (options.resourceId)
          query.append('resource_id', String(options.resourceId));
      }
      Debug.log(this, 'Requesting line items from: ' + lineitemsEndpoint);
      response = await platform.api.get(
        `${lineitemsEndpoint}${query.size > 0 ? `?${query.toString()}` : ''}`,
        {
          headers: {
            Authorization:
              accessToken.token_type + ' ' + accessToken.access_token,
            Accept: 'application/vnd.ims.lis.v2.lineitemcontainer+json',
          },
        },
        true,
      );
    }

    let lineItems = JSON.parse(JSON.stringify(response[0]));

    // Parsing link headers
    const parsedLinks =
      response[1].headers?.get('link') !== undefined
        ? parseLink(response[1].headers.get('link'))
        : {};

    // Applying special filters
    if (options && options.id)
      lineItems = lineItems.filter((lineitem: LineItem) => {
        return lineitem.id === options.id;
      });
    if (options && options.label)
      lineItems = lineItems.filter((lineitem: LineItem) => {
        return lineitem.label === options.label;
      });
    if (
      options &&
      options.limit &&
      (options.id || options.label) &&
      options.limit < lineItems.length
    )
      lineItems = lineItems.slice(0, options.limit);

    return this.formatResult(parsedLinks, lineItems);
  }

  /**
   * @description Creates a new lineItem for the given context
   * @param {IdToken} idToken - Idtoken for the user
   * @param {LineItem} lineItem - LineItem Object, following the application/vnd.ims.lis.v2.lineitem+json specification
   * @param {Object} [options] - Aditional configuration for the lineItem
   * @param {Boolean} [options.resourceLinkId = false] - If set to true, binds the created lineItem to the resource that originated the request
   * @param {AccessTokenType} accessToken
   */
  async createLineItem(
    idToken: IdToken,
    lineItem: CreateLineItem,
    options: { resourceLinkId?: boolean } = { resourceLinkId: false },
    accessToken?: AccessTokenType,
  ): Promise<LineItem> {
    // Validating lineItem
    if (!idToken) {
      Debug.log(this, 'Missing IdToken object.');
      throw new Error('MISSING_ID_TOKEN');
    }
    if (!lineItem) {
      Debug.log(this, 'Line item object missing.');
      throw new Error('MISSING_LINE_ITEM');
    }

    if (options && options.resourceLinkId)
      lineItem.resourceLinkId = idToken.platformContext.resource.id;

    Debug.log(this, 'Target platform: ' + idToken.iss);

    accessToken = await this.provider.checkAccessToken(
      idToken,
      'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
      accessToken,
    );
    const platform = await this.provider.getPlatformById(idToken.platformId);
    const lineitemsEndpoint = idToken.platformContext.endpoint.lineitems;

    Debug.log(this, 'Creating Line item: ');
    Debug.log(this, lineItem);

    const newLineItem: LineItem = await platform.api.post(lineitemsEndpoint, {
      headers: {
        Authorization: accessToken.token_type + ' ' + accessToken.access_token,
        'Content-Type': 'application/vnd.ims.lis.v2.lineitem+json',
      },
      body: JSON.stringify(lineItem),
    });

    Debug.log(this, 'Line item successfully created');
    return newLineItem as LineItem;
  }

  /**
   * @description Gets LineItem by the ID
   * @param {Object} idToken - Idtoken for the user
   * @param {String} lineItemId - LineItem ID.
   * @param {AccessTokenType} accessToken Optionally passed access token if already acquired
   */
  async getLineItemById(
    idToken: IdToken,
    lineItemId: string,
    accessToken?: AccessTokenType,
  ): Promise<LineItem> {
    if (!idToken) {
      Debug.log(this, 'Missing IdToken object.');
      throw new Error('MISSING_ID_TOKEN');
    }
    if (!lineItemId) {
      Debug.log(this, 'Missing lineItemID.');
      throw new Error('MISSING_LINEITEM_ID');
    }

    Debug.log(this, 'Target platform: ' + idToken.iss);

    accessToken = await this.provider.checkAccessToken(
      idToken,
      'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly',
      accessToken,
    );
    const platform = await this.provider.getPlatformById(idToken.platformId);

    const lineitemUrl = lineItemId;
    Debug.log(this, 'Retrieving: ' + lineitemUrl);
    const response = await platform.api.get(lineitemUrl, {
      headers: {
        Authorization: accessToken.token_type + ' ' + accessToken.access_token,
      },
    });
    Debug.log(this, 'LineItem sucessfully retrieved');
    return response as LineItem;
  }

  /**
   * @description Updates LineItem by the ID
   * @param {Object} idToken - Idtoken for the user
   * @param {String} lineItemId - LineItem ID.
   * @param {Object} lineItem - Updated fields.
   * @param {AccessTokenType} accessToken Optionally passed access token if already acquired
   */
  async updateLineItemById(
    idToken: IdToken,
    lineItemId: string,
    lineItem: CreateLineItem,
    accessToken?: AccessTokenType,
  ) {
    if (!idToken) {
      Debug.log(this, 'Missing IdToken object.');
      throw new Error('MISSING_ID_TOKEN');
    }
    if (!lineItemId) {
      Debug.log(this, 'Missing lineItemID.');
      throw new Error('MISSING_LINEITEM_ID');
    }
    if (!lineItem) {
      Debug.log(this, 'Missing lineItem object.');
      throw new Error('MISSING_LINE_ITEM');
    }

    Debug.log(this, 'Target platform: ' + idToken.iss);

    accessToken = await this.provider.checkAccessToken(
      idToken,
      'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
      accessToken,
    );
    const platform = await this.provider.getPlatformById(idToken.platformId);

    const lineitemUrl = lineItemId;
    Debug.log(this, 'Updating: ' + lineitemUrl);
    const response = await platform.api.put(lineitemUrl, {
      body: JSON.stringify(lineItem),
      headers: {
        Authorization: accessToken.token_type + ' ' + accessToken.access_token,
        'Content-Type': 'application/vnd.ims.lis.v2.lineitem+json',
      },
    });
    Debug.log(this, 'LineItem sucessfully updated');
    return response as LineItem;
  }

  /**
   * @description Deletes LineItem by the ID
   * @param {Object} idToken - Idtoken for the user
   * @param {String} lineItemId - LineItem ID.
   * @param {AccessTokenType} accessToken Optionally passed access token if already acquired
   */
  async deleteLineItemById(
    idToken: IdToken,
    lineItemId: string,
    accessToken?: AccessTokenType,
  ) {
    if (!idToken) {
      Debug.log(this, 'Missing IdToken object.');
      throw new Error('MISSING_ID_TOKEN');
    }
    if (!lineItemId) {
      Debug.log(this, 'Missing lineItemID.');
      throw new Error('MISSING_LINEITEM_ID');
    }

    Debug.log(this, 'Target platform: ' + idToken.iss);

    accessToken = await this.provider.checkAccessToken(
      idToken,
      'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
      accessToken,
    );
    const platform = await this.provider.getPlatformById(idToken.platformId);

    const lineitemUrl = lineItemId;
    Debug.log(this, 'Deleting: ' + lineitemUrl);
    await platform.api.delete(lineitemUrl, {
      headers: {
        Authorization: accessToken.token_type + ' ' + accessToken.access_token,
      },
    });
    Debug.log(this, 'LineItem sucessfully deleted');
    return true;
  }

  /**
   * @description Publishes a score or grade to a lineItem. Represents the Score Publish service described in the lti 1.3 specification.
   * @param {IdToken} idToken - Idtoken for the user.
   * @param {String} lineItemId - LineItem ID.
   * @param {Omit<ScoreType,'timestamp'>} score - Score/Grade following the LTI Standard application/vnd.ims.lis.v1.score+json.
   * @param {AccessTokenType} accessToken Optionally passed access token if already acquired
   */
  async submitScore(
    idToken: IdToken,
    lineItemId: string,
    score: Omit<ScoreType,'timestamp'>,
    accessToken?: AccessTokenType,
  ): Promise<ScoreType> {
    if (!idToken) {
      Debug.log(this, 'Missing IdToken object.');
      throw new Error('MISSING_ID_TOKEN');
    }
    if (!lineItemId) {
      Debug.log(this, 'Missing lineItemID.');
      throw new Error('MISSING_LINEITEM_ID');
    }
    if (!score) {
      Debug.log(this, 'Score object missing.');
      throw new Error('MISSING_SCORE');
    }
    Debug.log(this, 'Target platform: ' + idToken.iss);

    let newScore: ScoreType = {
      ...score,
      timestamp: new Date(Date.now()).toISOString(),
    };
    const shouldFetchScoreMaximum =
      newScore.scoreGiven !== undefined && newScore.scoreMaximum === undefined;
    const scopes = ['https://purl.imsglobal.org/spec/lti-ags/scope/score'];
    if (shouldFetchScoreMaximum) {
      scopes.push('https://purl.imsglobal.org/spec/lti-ags/scope/lineitem');
    }

    Debug.log(
      this,
      'Attempting to retrieve platform access_token for [' + idToken.iss + ']',
    );
    accessToken = await this.provider.checkAccessToken(
      idToken,
      scopes.join(' '),
      accessToken,
    );
    Debug.log(this, 'Access_token retrieved for [' + idToken.iss + ']');

    const platform = await this.provider.getPlatformById(idToken.platformId);

    // Creating scores URL
    const lineitemUrl = lineItemId;
    let scoreUrl = lineitemUrl + '/scores';
    if (lineitemUrl.indexOf('?') !== -1) {
      const query = lineitemUrl.split('\?')[1];
      const url = lineitemUrl.split('\?')[0];
      scoreUrl = url + '/scores?' + query;
    }

    // Creating scoreMaximum if it is not present and scoreGiven exists
    if (shouldFetchScoreMaximum) {
      const lineItem = await this.getLineItemById(
        idToken,
        lineItemId,
        accessToken,
      );
      newScore.scoreMaximum = lineItem.scoreMaximum;
    }

    // If no user is specified, sends the score to the user that originated request
    if (newScore.userId === undefined) {
      newScore.userId = idToken.user;
    }

    Debug.log(this, 'Sending score to: ' + scoreUrl);
    Debug.log(this, newScore);

    await platform.api.post(scoreUrl, {
      headers: {
        Authorization: accessToken.token_type + ' ' + accessToken.access_token,
        'Content-Type': 'application/vnd.ims.lis.v1.score+json',
      },
      body: JSON.stringify(newScore),
    });
    Debug.log(this, 'Score successfully sent');
    return newScore;
  }

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
  async getScores(
    idToken: IdToken,
    lineItemId: string,
    options: {
      userId: string | false;
      limit: number | false;
      url: string | false;
    } = { userId: false, limit: false, url: false },
    accessToken?: AccessTokenType,
  ): Promise<ResultType> {
    if (!idToken) {
      Debug.log(this, 'Missing IdToken object.');
      throw new Error('MISSING_ID_TOKEN');
    }
    if (!lineItemId) {
      Debug.log(this, 'Missing lineItemID.');
      throw new Error('MISSING_LINEITEM_ID');
    }

    Debug.log(this, 'Target platform: ' + idToken.iss);

    accessToken = await this.provider.checkAccessToken(
      idToken,
      [
        'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly',
        'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly',
      ].join(' '),
      accessToken,
    );
    const platform = await this.provider.getPlatformById(idToken.platformId);

    let response: [any, Response];
    if (options && options.url) {
      Debug.log(this, 'Requesting scores from: ' + options.url);
      response = await platform.api.get(
        options.url,
        {
          headers: {
            Authorization:
              accessToken.token_type + ' ' + accessToken.access_token,
            Accept: 'application/vnd.ims.lis.v2.resultcontainer+json',
          },
        },
        true,
      );
    } else {
      // Creating results URL
      const lineitemUrl = lineItemId;
      let query = new URLSearchParams();
      let resultsUrl = lineitemUrl + '/results';
      if (lineitemUrl.indexOf('?') !== -1) {
        query = new URLSearchParams(lineitemUrl.split('\?')[1]);
        const url = lineitemUrl.split('\?')[0];
        resultsUrl = url + '/results';
      }

      if (options) {
        if (options.userId) query.append('user_id', options.userId);
        if (options.limit) query.append('limit', String(options.limit));
      }
      Debug.log(this, 'Requesting scores from: ' + resultsUrl);
      response = await platform.api.get(
        `${resultsUrl}${query.size > 0 ? `?${query.toString()}` : ''}`,
        {
          headers: {
            Authorization:
              accessToken.token_type + ' ' + accessToken.access_token,
            Accept: 'application/vnd.ims.lis.v2.resultcontainer+json',
          },
        },
        true,
      );
    }

    // Parsing link headers
    const parsedLinks =
      response[1].headers?.get('link') !== undefined
        ? parseLink(response[1].headers.get('link'))
        : {};

    return this.formatResult(
      parsedLinks,
      undefined,
      JSON.parse(JSON.stringify(response[0])),
    );
  }
}
