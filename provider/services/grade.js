"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradeService = void 0;
const parseLink = require("parse-link-header");
const debug_1 = require("../../utils/debug");
class GradeService {
    constructor(provider) {
        this.provider = provider;
    }
    formatResult(parsedLinks, lineItems, scores) {
        return {
            next: parsedLinks?.next?.url,
            prev: parsedLinks?.prev?.url,
            first: parsedLinks?.first?.url,
            last: parsedLinks?.last?.url,
            lineItems,
            scores,
        };
    }
    async getLineItems(idToken, options, accessToken) {
        if (!idToken) {
            debug_1.Debug.log(this, 'Missing IdToken object.');
            throw new Error('MISSING_ID_TOKEN');
        }
        debug_1.Debug.log(this, 'Target platform: ' + idToken.iss);
        accessToken = await this.provider.checkAccessToken(idToken, 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly', accessToken);
        const platform = await this.provider.getPlatformById(idToken.platformId);
        let response;
        if (options && options.url) {
            debug_1.Debug.log(this, 'Requesting line items from: ' + options.url);
            response = await platform.api.get(options.url, {
                headers: {
                    Authorization: accessToken.token_type + ' ' + accessToken.access_token,
                    Accept: 'application/vnd.ims.lis.v2.lineitemcontainer+json',
                },
            }, true);
        }
        else {
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
                if (options.tag)
                    query.append('tag', options.tag);
                if (options.resourceId)
                    query.append('resource_id', String(options.resourceId));
            }
            debug_1.Debug.log(this, 'Requesting line items from: ' + lineitemsEndpoint);
            response = await platform.api.get(`${lineitemsEndpoint}${query.size > 0 ? `?${query.toString()}` : ''}`, {
                headers: {
                    Authorization: accessToken.token_type + ' ' + accessToken.access_token,
                    Accept: 'application/vnd.ims.lis.v2.lineitemcontainer+json',
                },
            }, true);
        }
        let lineItems = JSON.parse(JSON.stringify(response[0]));
        const parsedLinks = response[1].headers?.get('link') !== undefined
            ? parseLink(response[1].headers.get('link'))
            : {};
        if (options && options.id)
            lineItems = lineItems.filter((lineitem) => {
                return lineitem.id === options.id;
            });
        if (options && options.label)
            lineItems = lineItems.filter((lineitem) => {
                return lineitem.label === options.label;
            });
        if (options &&
            options.limit &&
            (options.id || options.label) &&
            options.limit < lineItems.length)
            lineItems = lineItems.slice(0, options.limit);
        return this.formatResult(parsedLinks, lineItems);
    }
    async createLineItem(idToken, lineItem, options = { resourceLinkId: false }, accessToken) {
        if (!idToken) {
            debug_1.Debug.log(this, 'Missing IdToken object.');
            throw new Error('MISSING_ID_TOKEN');
        }
        if (!lineItem) {
            debug_1.Debug.log(this, 'Line item object missing.');
            throw new Error('MISSING_LINE_ITEM');
        }
        if (options && options.resourceLinkId)
            lineItem.resourceLinkId = idToken.platformContext.resource.id;
        debug_1.Debug.log(this, 'Target platform: ' + idToken.iss);
        accessToken = await this.provider.checkAccessToken(idToken, 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem', accessToken);
        const platform = await this.provider.getPlatformById(idToken.platformId);
        const lineitemsEndpoint = idToken.platformContext.endpoint.lineitems;
        debug_1.Debug.log(this, 'Creating Line item: ');
        debug_1.Debug.log(this, lineItem);
        const newLineItem = await platform.api.post(lineitemsEndpoint, {
            headers: {
                Authorization: accessToken.token_type + ' ' + accessToken.access_token,
                'Content-Type': 'application/vnd.ims.lis.v2.lineitem+json',
            },
            body: JSON.stringify(lineItem),
        });
        debug_1.Debug.log(this, 'Line item successfully created');
        return newLineItem;
    }
    async getLineItemById(idToken, lineItemId, accessToken) {
        if (!idToken) {
            debug_1.Debug.log(this, 'Missing IdToken object.');
            throw new Error('MISSING_ID_TOKEN');
        }
        if (!lineItemId) {
            debug_1.Debug.log(this, 'Missing lineItemID.');
            throw new Error('MISSING_LINEITEM_ID');
        }
        debug_1.Debug.log(this, 'Target platform: ' + idToken.iss);
        accessToken = await this.provider.checkAccessToken(idToken, 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly', accessToken);
        const platform = await this.provider.getPlatformById(idToken.platformId);
        const lineitemUrl = lineItemId;
        debug_1.Debug.log(this, 'Retrieving: ' + lineitemUrl);
        const response = await platform.api.get(lineitemUrl, {
            headers: {
                Authorization: accessToken.token_type + ' ' + accessToken.access_token,
            },
        });
        debug_1.Debug.log(this, 'LineItem sucessfully retrieved');
        return response;
    }
    async updateLineItemById(idToken, lineItemId, lineItem, accessToken) {
        if (!idToken) {
            debug_1.Debug.log(this, 'Missing IdToken object.');
            throw new Error('MISSING_ID_TOKEN');
        }
        if (!lineItemId) {
            debug_1.Debug.log(this, 'Missing lineItemID.');
            throw new Error('MISSING_LINEITEM_ID');
        }
        if (!lineItem) {
            debug_1.Debug.log(this, 'Missing lineItem object.');
            throw new Error('MISSING_LINE_ITEM');
        }
        debug_1.Debug.log(this, 'Target platform: ' + idToken.iss);
        accessToken = await this.provider.checkAccessToken(idToken, 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem', accessToken);
        const platform = await this.provider.getPlatformById(idToken.platformId);
        const lineitemUrl = lineItemId;
        debug_1.Debug.log(this, 'Updating: ' + lineitemUrl);
        const response = await platform.api.put(lineitemUrl, {
            body: JSON.stringify(lineItem),
            headers: {
                Authorization: accessToken.token_type + ' ' + accessToken.access_token,
                'Content-Type': 'application/vnd.ims.lis.v2.lineitem+json',
            },
        });
        debug_1.Debug.log(this, 'LineItem sucessfully updated');
        return response;
    }
    async deleteLineItemById(idToken, lineItemId, accessToken) {
        if (!idToken) {
            debug_1.Debug.log(this, 'Missing IdToken object.');
            throw new Error('MISSING_ID_TOKEN');
        }
        if (!lineItemId) {
            debug_1.Debug.log(this, 'Missing lineItemID.');
            throw new Error('MISSING_LINEITEM_ID');
        }
        debug_1.Debug.log(this, 'Target platform: ' + idToken.iss);
        accessToken = await this.provider.checkAccessToken(idToken, 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem', accessToken);
        const platform = await this.provider.getPlatformById(idToken.platformId);
        const lineitemUrl = lineItemId;
        debug_1.Debug.log(this, 'Deleting: ' + lineitemUrl);
        await platform.api.delete(lineitemUrl, {
            headers: {
                Authorization: accessToken.token_type + ' ' + accessToken.access_token,
            },
        });
        debug_1.Debug.log(this, 'LineItem sucessfully deleted');
        return true;
    }
    async submitScore(idToken, lineItemId, score, accessToken) {
        if (!idToken) {
            debug_1.Debug.log(this, 'Missing IdToken object.');
            throw new Error('MISSING_ID_TOKEN');
        }
        if (!lineItemId) {
            debug_1.Debug.log(this, 'Missing lineItemID.');
            throw new Error('MISSING_LINEITEM_ID');
        }
        if (!score) {
            debug_1.Debug.log(this, 'Score object missing.');
            throw new Error('MISSING_SCORE');
        }
        debug_1.Debug.log(this, 'Target platform: ' + idToken.iss);
        let newScore = {
            ...score,
            timestamp: new Date(Date.now()).toISOString(),
        };
        const shouldFetchScoreMaximum = newScore.scoreGiven !== undefined && newScore.scoreMaximum === undefined;
        const scopes = ['https://purl.imsglobal.org/spec/lti-ags/scope/score'];
        if (shouldFetchScoreMaximum) {
            scopes.push('https://purl.imsglobal.org/spec/lti-ags/scope/lineitem');
        }
        debug_1.Debug.log(this, 'Attempting to retrieve platform access_token for [' + idToken.iss + ']');
        accessToken = await this.provider.checkAccessToken(idToken, scopes.join(' '), accessToken);
        debug_1.Debug.log(this, 'Access_token retrieved for [' + idToken.iss + ']');
        const platform = await this.provider.getPlatformById(idToken.platformId);
        const lineitemUrl = lineItemId;
        let scoreUrl = lineitemUrl + '/scores';
        if (lineitemUrl.indexOf('?') !== -1) {
            const query = lineitemUrl.split('\?')[1];
            const url = lineitemUrl.split('\?')[0];
            scoreUrl = url + '/scores?' + query;
        }
        if (shouldFetchScoreMaximum) {
            const lineItem = await this.getLineItemById(idToken, lineItemId, accessToken);
            newScore.scoreMaximum = lineItem.scoreMaximum;
        }
        if (newScore.userId === undefined) {
            newScore.userId = idToken.user;
        }
        debug_1.Debug.log(this, 'Sending score to: ' + scoreUrl);
        debug_1.Debug.log(this, newScore);
        await platform.api.post(scoreUrl, {
            headers: {
                Authorization: accessToken.token_type + ' ' + accessToken.access_token,
                'Content-Type': 'application/vnd.ims.lis.v1.score+json',
            },
            body: JSON.stringify(newScore),
        });
        debug_1.Debug.log(this, 'Score successfully sent');
        return newScore;
    }
    async getScores(idToken, lineItemId, options = { userId: false, limit: false, url: false }, accessToken) {
        if (!idToken) {
            debug_1.Debug.log(this, 'Missing IdToken object.');
            throw new Error('MISSING_ID_TOKEN');
        }
        if (!lineItemId) {
            debug_1.Debug.log(this, 'Missing lineItemID.');
            throw new Error('MISSING_LINEITEM_ID');
        }
        debug_1.Debug.log(this, 'Target platform: ' + idToken.iss);
        accessToken = await this.provider.checkAccessToken(idToken, [
            'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly',
            'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly',
        ].join(' '), accessToken);
        const platform = await this.provider.getPlatformById(idToken.platformId);
        let response;
        if (options && options.url) {
            debug_1.Debug.log(this, 'Requesting scores from: ' + options.url);
            response = await platform.api.get(options.url, {
                headers: {
                    Authorization: accessToken.token_type + ' ' + accessToken.access_token,
                    Accept: 'application/vnd.ims.lis.v2.resultcontainer+json',
                },
            }, true);
        }
        else {
            const lineitemUrl = lineItemId;
            let query = new URLSearchParams();
            let resultsUrl = lineitemUrl + '/results';
            if (lineitemUrl.indexOf('?') !== -1) {
                query = new URLSearchParams(lineitemUrl.split('\?')[1]);
                const url = lineitemUrl.split('\?')[0];
                resultsUrl = url + '/results';
            }
            if (options) {
                if (options.userId)
                    query.append('user_id', options.userId);
                if (options.limit)
                    query.append('limit', String(options.limit));
            }
            debug_1.Debug.log(this, 'Requesting scores from: ' + resultsUrl);
            response = await platform.api.get(`${resultsUrl}${query.size > 0 ? `?${query.toString()}` : ''}`, {
                headers: {
                    Authorization: accessToken.token_type + ' ' + accessToken.access_token,
                    Accept: 'application/vnd.ims.lis.v2.resultcontainer+json',
                },
            }, true);
        }
        const parsedLinks = response[1].headers?.get('link') !== undefined
            ? parseLink(response[1].headers.get('link'))
            : {};
        return this.formatResult(parsedLinks, undefined, JSON.parse(JSON.stringify(response[0])));
    }
}
exports.GradeService = GradeService;
//# sourceMappingURL=grade.js.map