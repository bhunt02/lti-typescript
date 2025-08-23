"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.Platform = void 0;
var platform_entity_1 = require("../entities/platform.entity");
var database_1 = require("./database");
var key_entity_1 = require("../entities/key.entity");
var access_token_entity_1 = require("../entities/access_token.entity");
var auth_1 = require("./auth");
var debug_1 = require("./debug");
var Platform = (function () {
    function Platform(platformModel) {
        this.platformModel = platformModel;
        this.api = new PlatformApi();
    }
    Object.defineProperty(Platform.prototype, "platformUrl", {
        get: function () {
            return this.platformModel.platformUrl;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Platform.prototype, "clientId", {
        get: function () {
            return this.platformModel.clientId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Platform.prototype, "name", {
        get: function () {
            return this.platformModel.name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Platform.prototype, "authenticationEndpoint", {
        get: function () {
            return this.platformModel.authenticationEndpoint;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Platform.prototype, "accessTokenEndpoint", {
        get: function () {
            return this.platformModel.accessTokenEndpoint;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Platform.prototype, "authorizationServer", {
        get: function () {
            var _a;
            return ((_a = this.platformModel.authorizationServer) !== null && _a !== void 0 ? _a : this.platformModel.accessTokenEndpoint);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Platform.prototype, "kid", {
        get: function () {
            return this.platformModel.kid;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Platform.prototype, "authToken", {
        get: function () {
            return this.platformModel.authToken();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Platform.prototype, "active", {
        get: function () {
            return this.platformModel.active;
        },
        enumerable: false,
        configurable: true
    });
    Platform.prototype.setName = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, database_1.Database.update(platform_entity_1.PlatformModel, {
                            name: name,
                        }, {
                            platformUrl: this.platformUrl,
                            clientId: this.clientId,
                        })];
                    case 1:
                        _a.sent();
                        return [4, this.platformModel.reload()];
                    case 2:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    Platform.prototype.setActive = function (active) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, database_1.Database.update(platform_entity_1.PlatformModel, {
                            active: active,
                        }, {
                            platformUrl: this.platformUrl,
                            clientId: this.clientId,
                        })];
                    case 1:
                        _a.sent();
                        return [4, this.platformModel.reload()];
                    case 2:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    Platform.prototype.platformPublicKey = function () {
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, database_1.Database.findOne(key_entity_1.PublicKeyModel, {
                            where: { kid: this.kid },
                        })];
                    case 1:
                        key = _a.sent();
                        return [2, key.data];
                }
            });
        });
    };
    Platform.prototype.platformPrivateKey = function () {
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, database_1.Database.findOne(key_entity_1.PrivateKeyModel, {
                            where: { kid: this.kid },
                        })];
                    case 1:
                        key = _a.sent();
                        return [2, key.data];
                }
            });
        });
    };
    Platform.prototype.setAuthConfig = function (method, key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, database_1.Database.update(platform_entity_1.PlatformModel, {
                            authTokenMethod: method || this.authToken.method,
                            authTokenKey: key || this.authToken.key,
                        }, {
                            platformUrl: this.platformUrl,
                            clientId: this.clientId,
                        })];
                    case 1:
                        _a.sent();
                        return [4, this.platformModel.reload()];
                    case 2:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    Platform.prototype.setAuthenticationEndpoint = function (authenticationEndpoint) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, database_1.Database.update(platform_entity_1.PlatformModel, {
                            authenticationEndpoint: authenticationEndpoint,
                        }, {
                            platformUrl: this.platformUrl,
                            clientId: this.clientId,
                        })];
                    case 1:
                        _a.sent();
                        return [4, this.platformModel.reload()];
                    case 2:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    Platform.prototype.setAccessTokenEndpoint = function (accessTokenEndpoint) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, database_1.Database.update(platform_entity_1.PlatformModel, {
                            accessTokenEndpoint: accessTokenEndpoint,
                        }, {
                            platformUrl: this.platformUrl,
                            clientId: this.clientId,
                        })];
                    case 1:
                        _a.sent();
                        return [4, this.platformModel.reload()];
                    case 2:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    Platform.prototype.setAuthorizationServer = function (authorizationServer) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, database_1.Database.update(platform_entity_1.PlatformModel, {
                            authorizationServer: authorizationServer,
                        }, {
                            platformUrl: this.platformUrl,
                            clientId: this.clientId,
                        })];
                    case 1:
                        _a.sent();
                        return [4, this.platformModel.reload()];
                    case 2:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    Platform.prototype.getAccessToken = function (scopes) {
        return __awaiter(this, void 0, void 0, function () {
            var existingToken, token, expired;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, database_1.Database.findOne(access_token_entity_1.AccessTokenModel, {
                            where: { platformUrl: this.platformUrl, clientId: this.clientId, scopes: scopes },
                        })];
                    case 1:
                        existingToken = _a.sent();
                        expired = existingToken &&
                            (Date.now() - existingToken.createdAt.getTime()) / 1000 >
                                existingToken.expiresAt;
                        if (!(!existingToken || expired)) return [3, 3];
                        debug_1.Debug.log(this, 'Valid access_token for ' + this.platformUrl + ' not found');
                        debug_1.Debug.log(this, 'Attempting to generate new access_token for ' + this.platformUrl);
                        debug_1.Debug.log(this, 'With scopes: ' + scopes);
                        return [4, auth_1.Auth.getAccessToken(scopes, this)];
                    case 2:
                        token = _a.sent();
                        return [3, 4];
                    case 3:
                        debug_1.Debug.log(this, 'Access_token found');
                        token = existingToken.data;
                        _a.label = 4;
                    case 4:
                        token.token_type =
                            token.token_type.charAt(0).toUpperCase() + token.token_type.slice(1);
                        return [2, token];
                }
            });
        });
    };
    Platform.prototype.platformParams = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {
                            kid: this.kid,
                            platformUrl: this.platformUrl,
                            clientId: this.clientId,
                            name: this.name,
                            authenticationEndpoint: this.authenticationEndpoint,
                            accessTokenEndpoint: this.accessTokenEndpoint,
                            authToken: this.authToken
                        };
                        return [4, this.platformPublicKey()];
                    case 1: return [2, (_a.publicKey = _b.sent(),
                            _a.active = this.active,
                            _a)];
                }
            });
        });
    };
    Platform.prototype.delete = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, database_1.Database.delete(key_entity_1.PublicKeyModel, { kid: this.kid })];
                    case 1:
                        _a.sent();
                        return [4, database_1.Database.delete(key_entity_1.PrivateKeyModel, { kid: this.kid })];
                    case 2:
                        _a.sent();
                        return [4, database_1.Database.delete(platform_entity_1.PlatformModel, {
                                platformUrl: this.platformUrl,
                                clientId: this.clientId,
                            })];
                    case 3:
                        _a.sent();
                        return [2, this];
                }
            });
        });
    };
    return Platform;
}());
exports.Platform = Platform;
var PlatformApi = (function () {
    function PlatformApi() {
    }
    PlatformApi.prototype.request = function (url_1, method_1, request_1) {
        return __awaiter(this, arguments, void 0, function (url, method, request, fullResponse) {
            var _this = this;
            if (fullResponse === void 0) { fullResponse = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, fetch(url, __assign(__assign({}, request), { method: method }))
                            .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!res.ok) {
                                            throw { status: res.status, message: res.statusText };
                                        }
                                        if (res.status == 204) {
                                            if (fullResponse) {
                                                return [2, [undefined, res]];
                                            }
                                            return [2];
                                        }
                                        if (!fullResponse) return [3, 2];
                                        return [4, res.json()];
                                    case 1: return [2, [_a.sent(), res]];
                                    case 2: return [4, res.json()];
                                    case 3: return [2, _a.sent()];
                                }
                            });
                        }); })
                            .catch(function (err) {
                            if ('status' in err) {
                                throw new Error("".concat(err.status, ": ").concat(err.message));
                            }
                            throw new Error("500: ".concat(err.toString()));
                        })];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    PlatformApi.prototype.get = function (url_1, request_1) {
        return __awaiter(this, arguments, void 0, function (url, request, fullResponse) {
            if (fullResponse === void 0) { fullResponse = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.request(url, 'GET', request, fullResponse)];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    PlatformApi.prototype.post = function (url_1, request_1) {
        return __awaiter(this, arguments, void 0, function (url, request, fullResponse) {
            if (fullResponse === void 0) { fullResponse = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.request(url, 'POST', request, fullResponse)];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    PlatformApi.prototype.put = function (url_1, request_1) {
        return __awaiter(this, arguments, void 0, function (url, request, fullResponse) {
            if (fullResponse === void 0) { fullResponse = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.request(url, 'PUT', request, fullResponse)];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    PlatformApi.prototype.patch = function (url_1, request_1) {
        return __awaiter(this, arguments, void 0, function (url, request, fullResponse) {
            if (fullResponse === void 0) { fullResponse = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.request(url, 'PATCH', request, fullResponse)];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    PlatformApi.prototype.delete = function (url_1, request_1) {
        return __awaiter(this, arguments, void 0, function (url, request, fullResponse) {
            if (fullResponse === void 0) { fullResponse = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.request(url, 'DELETE', request, fullResponse)];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    return PlatformApi;
}());
