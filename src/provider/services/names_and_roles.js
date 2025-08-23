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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NamesAndRolesService = void 0;
var parseLink = require("parse-link-header");
var debug_1 = require("../../utils/debug");
var NamesAndRolesService = (function () {
    function NamesAndRolesService(provider) {
        this.provider = provider;
    }
    NamesAndRolesService.prototype.getMembers = function (idToken_1) {
        return __awaiter(this, arguments, void 0, function (idToken, options) {
            var accessToken, platform, pages, query, next, differences, result, curPage, response, body, parsedLinks;
            var _a;
            if (options === void 0) { options = { pages: 1, resourceLinkId: false }; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!idToken) {
                            debug_1.Debug.log(this, 'Missing IdToken object.');
                            throw new Error('MISSING_ID_TOKEN');
                        }
                        debug_1.Debug.log(this, 'Attempting to retrieve memberships');
                        debug_1.Debug.log(this, 'Target platform: ' + idToken.iss);
                        return [4, this.provider.checkAccessToken(idToken, 'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly')];
                    case 1:
                        accessToken = _b.sent();
                        return [4, this.provider.getPlatformById(idToken.platformId)];
                    case 2:
                        platform = _b.sent();
                        pages = 1;
                        query = new URLSearchParams();
                        next = idToken.platformContext.namesRoles.context_memberships_url;
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
                        curPage = 1;
                        _b.label = 3;
                    case 3:
                        if (pages && curPage > pages) {
                            if (next)
                                result.next = next;
                            return [3, 9];
                        }
                        response = void 0;
                        debug_1.Debug.log(this, 'Member pages found: ', curPage);
                        debug_1.Debug.log(this, 'Current member page: ', next);
                        if (!(query && curPage === 1)) return [3, 5];
                        return [4, platform.api.get("".concat(next).concat(query.size > 0 ? "?".concat(query.toString()) : ''), {
                                headers: {
                                    Authorization: accessToken.token_type + ' ' + accessToken.access_token,
                                    Accept: 'application/vnd.ims.lti-nrps.v2.membershipcontainer+json',
                                },
                            }, true)];
                    case 4:
                        response = _b.sent();
                        return [3, 7];
                    case 5: return [4, platform.api.get(next, {
                            headers: {
                                Authorization: accessToken.token_type + ' ' + accessToken.access_token,
                                Accept: 'application/vnd.ims.lti-nrps.v2.membershipcontainer+json',
                            },
                        }, true)];
                    case 6:
                        response = _b.sent();
                        _b.label = 7;
                    case 7:
                        body = response[0]
                            ? JSON.parse(JSON.stringify(response[0]))
                            : undefined;
                        if (body) {
                            if (!result) {
                                result = body;
                            }
                            else {
                                result.members = __spreadArray(__spreadArray([], result.members, true), body === null || body === void 0 ? void 0 : body.members, true);
                            }
                        }
                        parsedLinks = ((_a = response[1].headers) === null || _a === void 0 ? void 0 : _a.get('link'))
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
                        _b.label = 8;
                    case 8:
                        if (next) return [3, 3];
                        _b.label = 9;
                    case 9:
                        if (differences)
                            result.differences = differences;
                        debug_1.Debug.log(this, 'Memberships retrieved');
                        return [2, result];
                }
            });
        });
    };
    return NamesAndRolesService;
}());
exports.NamesAndRolesService = NamesAndRolesService;
