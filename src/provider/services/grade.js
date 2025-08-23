"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradeService = void 0;
var parseLink = require("parse-link-header");
var debug_1 = require("../../utils/debug");
var GradeService = (function () {
    function GradeService(provider) {
        this.provider = provider;
    }
    GradeService.prototype.formatResult = function (parsedLinks, lineItems, scores) {
        var _a, _b, _c, _d;
        return {
            next: (_a = parsedLinks === null || parsedLinks === void 0 ? void 0 : parsedLinks.next) === null || _a === void 0 ? void 0 : _a.url,
            prev: (_b = parsedLinks === null || parsedLinks === void 0 ? void 0 : parsedLinks.prev) === null || _b === void 0 ? void 0 : _b.url,
            first: (_c = parsedLinks === null || parsedLinks === void 0 ? void 0 : parsedLinks.first) === null || _c === void 0 ? void 0 : _c.url,
            last: (_d = parsedLinks === null || parsedLinks === void 0 ? void 0 : parsedLinks.last) === null || _d === void 0 ? void 0 : _d.url,
            lineItems: lineItems,
            scores: scores,
        };
    };
    GradeService.prototype.getLineItems = function (idToken, options, accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var platform, response, lineitemsEndpoint, query, lineItems, parsedLinks;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!idToken) {
                            debug_1.Debug.log(this, 'Missing IdToken object.');
                            throw new Error('MISSING_ID_TOKEN');
                        }
                        debug_1.Debug.log(this, 'Target platform: ' + idToken.iss);
                        return [4, this.provider.checkAccessToken(idToken, 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly', accessToken)];
                    case 1:
                        accessToken = _b.sent();
                        return [4, this.provider.getPlatformById(idToken.platformId)];
                    case 2:
                        platform = _b.sent();
                        if (!(options && options.url)) return [3, 4];
                        debug_1.Debug.log(this, 'Requesting line items from: ' + options.url);
                        return [4, platform.api.get(options.url, {
                                headers: {
                                    Authorization: accessToken.token_type + ' ' + accessToken.access_token,
                                    Accept: 'application/vnd.ims.lis.v2.lineitemcontainer+json',
                                },
                            }, true)];
                    case 3:
                        response = _b.sent();
                        return [3, 6];
                    case 4:
                        lineitemsEndpoint = idToken.platformContext.endpoint.lineitems;
                        query = new URLSearchParams();
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
                        return [4, platform.api.get("".concat(lineitemsEndpoint).concat(query.size > 0 ? "?".concat(query.toString()) : ''), {
                                headers: {
                                    Authorization: accessToken.token_type + ' ' + accessToken.access_token,
                                    Accept: 'application/vnd.ims.lis.v2.lineitemcontainer+json',
                                },
                            }, true)];
                    case 5:
                        response = _b.sent();
                        _b.label = 6;
                    case 6:
                        lineItems = JSON.parse(JSON.stringify(response[0]));
                        parsedLinks = ((_a = response[1].headers) === null || _a === void 0 ? void 0 : _a.get('link')) !== undefined
                            ? parseLink(response[1].headers.get('link'))
                            : {};
                        if (options && options.id)
                            lineItems = lineItems.filter(function (lineitem) {
                                return lineitem.id === options.id;
                            });
                        if (options && options.label)
                            lineItems = lineItems.filter(function (lineitem) {
                                return lineitem.label === options.label;
                            });
                        if (options &&
                            options.limit &&
                            (options.id || options.label) &&
                            options.limit < lineItems.length)
                            lineItems = lineItems.slice(0, options.limit);
                        return [2, this.formatResult(parsedLinks, lineItems)];
                }
            });
        });
    };
    GradeService.prototype.createLineItem = function (idToken_1, lineItem_1) {
        return __awaiter(this, arguments, void 0, function (idToken, lineItem, options, accessToken) {
            var platform, lineitemsEndpoint, newLineItem;
            if (options === void 0) { options = { resourceLinkId: false }; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
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
                        return [4, this.provider.checkAccessToken(idToken, 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem', accessToken)];
                    case 1:
                        accessToken = _a.sent();
                        return [4, this.provider.getPlatformById(idToken.platformId)];
                    case 2:
                        platform = _a.sent();
                        lineitemsEndpoint = idToken.platformContext.endpoint.lineitems;
                        debug_1.Debug.log(this, 'Creating Line item: ');
                        debug_1.Debug.log(this, lineItem);
                        return [4, platform.api.post(lineitemsEndpoint, {
                                headers: {
                                    Authorization: accessToken.token_type + ' ' + accessToken.access_token,
                                    'Content-Type': 'application/vnd.ims.lis.v2.lineitem+json',
                                },
                                body: JSON.stringify(lineItem),
                            })];
                    case 3:
                        newLineItem = _a.sent();
                        debug_1.Debug.log(this, 'Line item successfully created');
                        return [2, newLineItem];
                }
            });
        });
    };
    GradeService.prototype.getLineItemById = function (idToken, lineItemId, accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var platform, lineitemUrl, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!idToken) {
                            debug_1.Debug.log(this, 'Missing IdToken object.');
                            throw new Error('MISSING_ID_TOKEN');
                        }
                        if (!lineItemId) {
                            debug_1.Debug.log(this, 'Missing lineItemID.');
                            throw new Error('MISSING_LINEITEM_ID');
                        }
                        debug_1.Debug.log(this, 'Target platform: ' + idToken.iss);
                        return [4, this.provider.checkAccessToken(idToken, 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly', accessToken)];
                    case 1:
                        accessToken = _a.sent();
                        return [4, this.provider.getPlatformById(idToken.platformId)];
                    case 2:
                        platform = _a.sent();
                        lineitemUrl = lineItemId;
                        debug_1.Debug.log(this, 'Retrieving: ' + lineitemUrl);
                        return [4, platform.api.get(lineitemUrl, {
                                headers: {
                                    Authorization: accessToken.token_type + ' ' + accessToken.access_token,
                                },
                            })];
                    case 3:
                        response = _a.sent();
                        debug_1.Debug.log(this, 'LineItem sucessfully retrieved');
                        return [2, response];
                }
            });
        });
    };
    GradeService.prototype.updateLineItemById = function (idToken, lineItemId, lineItem, accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var platform, lineitemUrl, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
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
                        return [4, this.provider.checkAccessToken(idToken, 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem', accessToken)];
                    case 1:
                        accessToken = _a.sent();
                        return [4, this.provider.getPlatformById(idToken.platformId)];
                    case 2:
                        platform = _a.sent();
                        lineitemUrl = lineItemId;
                        debug_1.Debug.log(this, 'Updating: ' + lineitemUrl);
                        return [4, platform.api.put(lineitemUrl, {
                                body: JSON.stringify(lineItem),
                                headers: {
                                    Authorization: accessToken.token_type + ' ' + accessToken.access_token,
                                    'Content-Type': 'application/vnd.ims.lis.v2.lineitem+json',
                                },
                            })];
                    case 3:
                        response = _a.sent();
                        debug_1.Debug.log(this, 'LineItem sucessfully updated');
                        return [2, response];
                }
            });
        });
    };
    GradeService.prototype.deleteLineItemById = function (idToken, lineItemId, accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var platform, lineitemUrl;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!idToken) {
                            debug_1.Debug.log(this, 'Missing IdToken object.');
                            throw new Error('MISSING_ID_TOKEN');
                        }
                        if (!lineItemId) {
                            debug_1.Debug.log(this, 'Missing lineItemID.');
                            throw new Error('MISSING_LINEITEM_ID');
                        }
                        debug_1.Debug.log(this, 'Target platform: ' + idToken.iss);
                        return [4, this.provider.checkAccessToken(idToken, 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem', accessToken)];
                    case 1:
                        accessToken = _a.sent();
                        return [4, this.provider.getPlatformById(idToken.platformId)];
                    case 2:
                        platform = _a.sent();
                        lineitemUrl = lineItemId;
                        debug_1.Debug.log(this, 'Deleting: ' + lineitemUrl);
                        return [4, platform.api.delete(lineitemUrl, {
                                headers: {
                                    Authorization: accessToken.token_type + ' ' + accessToken.access_token,
                                },
                            })];
                    case 3:
                        _a.sent();
                        debug_1.Debug.log(this, 'LineItem sucessfully deleted');
                        return [2, true];
                }
            });
        });
    };
    GradeService.prototype.submitScore = function (idToken, lineItemId, score, accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var shouldFetchScoreMaximum, scopes, platform, lineitemUrl, scoreUrl, query, url, lineItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
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
                        shouldFetchScoreMaximum = score.scoreGiven !== undefined && score.scoreMaximum === undefined;
                        scopes = ['https://purl.imsglobal.org/spec/lti-ags/scope/score'];
                        if (shouldFetchScoreMaximum) {
                            scopes.push('https://purl.imsglobal.org/spec/lti-ags/scope/lineitem');
                        }
                        debug_1.Debug.log(this, 'Attempting to retrieve platform access_token for [' + idToken.iss + ']');
                        return [4, this.provider.checkAccessToken(idToken, scopes.join(' '), accessToken)];
                    case 1:
                        accessToken = _a.sent();
                        debug_1.Debug.log(this, 'Access_token retrieved for [' + idToken.iss + ']');
                        return [4, this.provider.getPlatformById(idToken.platformId)];
                    case 2:
                        platform = _a.sent();
                        lineitemUrl = lineItemId;
                        scoreUrl = lineitemUrl + '/scores';
                        if (lineitemUrl.indexOf('?') !== -1) {
                            query = lineitemUrl.split('\?')[1];
                            url = lineitemUrl.split('\?')[0];
                            scoreUrl = url + '/scores?' + query;
                        }
                        if (!shouldFetchScoreMaximum) return [3, 4];
                        return [4, this.getLineItemById(idToken, lineItemId, accessToken)];
                    case 3:
                        lineItem = _a.sent();
                        score.scoreMaximum = lineItem.scoreMaximum;
                        _a.label = 4;
                    case 4:
                        if (score.userId === undefined) {
                            score.userId = idToken.user;
                        }
                        score.timestamp = new Date(Date.now()).toISOString();
                        debug_1.Debug.log(this, 'Sending score to: ' + scoreUrl);
                        debug_1.Debug.log(this, score);
                        return [4, platform.api.post(scoreUrl, {
                                headers: {
                                    Authorization: accessToken.token_type + ' ' + accessToken.access_token,
                                    'Content-Type': 'application/vnd.ims.lis.v1.score+json',
                                },
                                body: JSON.stringify(score),
                            })];
                    case 5:
                        _a.sent();
                        debug_1.Debug.log(this, 'Score successfully sent');
                        return [2, score];
                }
            });
        });
    };
    GradeService.prototype.getScores = function (idToken_1, lineItemId_1) {
        return __awaiter(this, arguments, void 0, function (idToken, lineItemId, options, accessToken) {
            var platform, response, lineitemUrl, query, resultsUrl, url, parsedLinks;
            var _a;
            if (options === void 0) { options = { userId: false, limit: false, url: false }; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!idToken) {
                            debug_1.Debug.log(this, 'Missing IdToken object.');
                            throw new Error('MISSING_ID_TOKEN');
                        }
                        if (!lineItemId) {
                            debug_1.Debug.log(this, 'Missing lineItemID.');
                            throw new Error('MISSING_LINEITEM_ID');
                        }
                        debug_1.Debug.log(this, 'Target platform: ' + idToken.iss);
                        return [4, this.provider.checkAccessToken(idToken, [
                                'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly',
                                'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly',
                            ].join(' '), accessToken)];
                    case 1:
                        accessToken = _b.sent();
                        return [4, this.provider.getPlatformById(idToken.platformId)];
                    case 2:
                        platform = _b.sent();
                        if (!(options && options.url)) return [3, 4];
                        debug_1.Debug.log(this, 'Requesting scores from: ' + options.url);
                        return [4, platform.api.get(options.url, {
                                headers: {
                                    Authorization: accessToken.token_type + ' ' + accessToken.access_token,
                                    Accept: 'application/vnd.ims.lis.v2.resultcontainer+json',
                                },
                            }, true)];
                    case 3:
                        response = _b.sent();
                        return [3, 6];
                    case 4:
                        lineitemUrl = lineItemId;
                        query = new URLSearchParams();
                        resultsUrl = lineitemUrl + '/results';
                        if (lineitemUrl.indexOf('?') !== -1) {
                            query = new URLSearchParams(lineitemUrl.split('\?')[1]);
                            url = lineitemUrl.split('\?')[0];
                            resultsUrl = url + '/results';
                        }
                        if (options) {
                            if (options.userId)
                                query.append('user_id', options.userId);
                            if (options.limit)
                                query.append('limit', String(options.limit));
                        }
                        debug_1.Debug.log(this, 'Requesting scores from: ' + resultsUrl);
                        return [4, platform.api.get("".concat(resultsUrl).concat(query.size > 0 ? "?".concat(query.toString()) : ''), {
                                headers: {
                                    Authorization: accessToken.token_type + ' ' + accessToken.access_token,
                                    Accept: 'application/vnd.ims.lis.v2.resultcontainer+json',
                                },
                            }, true)];
                    case 5:
                        response = _b.sent();
                        _b.label = 6;
                    case 6:
                        parsedLinks = ((_a = response[1].headers) === null || _a === void 0 ? void 0 : _a.get('link')) !== undefined
                            ? parseLink(response[1].headers.get('link'))
                            : {};
                        return [2, this.formatResult(parsedLinks, undefined, JSON.parse(JSON.stringify(response[0])))];
                }
            });
        });
    };
    return GradeService;
}());
exports.GradeService = GradeService;
