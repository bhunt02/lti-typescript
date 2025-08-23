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
exports.DeepLinkingService = void 0;
var jwt = require("jsonwebtoken");
var debug_1 = require("../../utils/debug");
var DeepLinkingService = (function () {
    function DeepLinkingService(provider) {
        this.provider = provider;
    }
    DeepLinkingService.prototype.createDeepLinkingForm = function (idToken, contentItems, options) {
        return __awaiter(this, void 0, void 0, function () {
            var message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.createDeepLinkingMessage(idToken, contentItems, options)];
                    case 1:
                        message = _a.sent();
                        return [2, "\n      <form id=\"ltijs_submit\" style=\"display: none;\" action=\"".concat(idToken.platformContext.deepLinkingSettings.deep_link_return_url, "\" method=\"POST\">\n          <input type=\"hidden\" name=\"JWT\" value=\"").concat(message, "\" />\n      </form>\n      <script>\n        document.getElementById(\"ltijs_submit\").submit()\n      </script>\n    ")];
                }
            });
        });
    };
    DeepLinkingService.prototype.createDeepLinkingMessage = function (idToken, contentItems, options) {
        return __awaiter(this, void 0, void 0, function () {
            var platform, jwtBody, selectedContentItems, acceptedTypes, acceptMultiple, _i, contentItems_1, contentItem, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        debug_1.Debug.log(this, 'Starting deep linking process');
                        if (!idToken) {
                            debug_1.Debug.log(this, 'Missing IdToken object.');
                            throw new Error('MISSING_ID_TOKEN');
                        }
                        if (!idToken.platformContext.deepLinkingSettings) {
                            debug_1.Debug.log(this, 'DeepLinkingSettings object missing.');
                            throw new Error('MISSING_DEEP_LINK_SETTINGS');
                        }
                        if (!contentItems) {
                            debug_1.Debug.log(this, 'No content item passed.');
                            throw new Error('MISSING_CONTENT_ITEMS');
                        }
                        if (!Array.isArray(contentItems))
                            contentItems = [contentItems];
                        return [4, this.provider.getPlatform(idToken.iss, idToken.clientId)];
                    case 1:
                        platform = _d.sent();
                        if (!platform) {
                            debug_1.Debug.log(this, 'Platform not found');
                            throw new Error('PLATFORM_NOT_FOUND');
                        }
                        if (!platform.active)
                            throw new Error('PLATFORM_NOT_ACTIVATED');
                        debug_1.Debug.log(this, 'Building basic JWT body');
                        jwtBody = {
                            iss: platform.clientId,
                            aud: idToken.iss,
                            nonce: encodeURIComponent(__spreadArray([], Array(25), true).map(function (_) { return ((Math.random() * 36) | 0).toString(36); })
                                .join('')),
                            'https://purl.imsglobal.org/spec/lti/claim/deployment_id': idToken.deploymentId,
                            'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiDeepLinkingResponse',
                            'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
                        };
                        if (options) {
                            if (options.message)
                                jwtBody['https://purl.imsglobal.org/spec/lti-dl/claim/msg'] =
                                    options.message;
                            if (options.errMessage)
                                jwtBody['https://purl.imsglobal.org/spec/lti-dl/claim/errormsg'] =
                                    options.errMessage;
                            if (options.log)
                                jwtBody['https://purl.imsglobal.org/spec/lti-dl/claim/log'] =
                                    options.log;
                            if (options.errLog)
                                jwtBody['https://purl.imsglobal.org/spec/lti-dl/claim/errorlog'] =
                                    options.errLog;
                        }
                        if (idToken.platformContext.deepLinkingSettings.data)
                            jwtBody['https://purl.imsglobal.org/spec/lti-dl/claim/data'] =
                                idToken.platformContext.deepLinkingSettings.data;
                        debug_1.Debug.log(this, "Sanitizing content item array based on the platform's requirements:");
                        selectedContentItems = [];
                        acceptedTypes = idToken.platformContext.deepLinkingSettings.accept_types;
                        acceptMultiple = !(idToken.platformContext.deepLinkingSettings.accept_multiple === 'false' ||
                            idToken.platformContext.deepLinkingSettings.accept_multiple === false);
                        debug_1.Debug.log(this, 'Accepted Types: ' + acceptedTypes);
                        debug_1.Debug.log(this, 'Accepts Mutiple: ' + acceptMultiple);
                        debug_1.Debug.log(this, 'Received content items: ');
                        debug_1.Debug.log(this, contentItems);
                        for (_i = 0, contentItems_1 = contentItems; _i < contentItems_1.length; _i++) {
                            contentItem = contentItems_1[_i];
                            if (!acceptedTypes.includes(contentItem.type))
                                continue;
                            selectedContentItems.push(contentItem);
                            if (!acceptMultiple)
                                break;
                        }
                        debug_1.Debug.log(this, 'Content items to be sent: ');
                        debug_1.Debug.log(this, selectedContentItems);
                        jwtBody['https://purl.imsglobal.org/spec/lti-dl/claim/content_items'] =
                            selectedContentItems;
                        _b = (_a = jwt).sign;
                        _c = [jwtBody];
                        return [4, platform.platformPrivateKey()];
                    case 2: return [2, _b.apply(_a, _c.concat([_d.sent(), {
                                algorithm: 'RS256',
                                expiresIn: 60,
                                keyid: platform.kid,
                            }]))];
                }
            });
        });
    };
    return DeepLinkingService;
}());
exports.DeepLinkingService = DeepLinkingService;
