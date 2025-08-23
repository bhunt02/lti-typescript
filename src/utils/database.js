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
exports.Database = void 0;
var typeorm_1 = require("typeorm");
var crypto = require("crypto");
var platform_entity_1 = require("../entities/platform.entity");
var access_token_entity_1 = require("../entities/access_token.entity");
var context_token_entity_1 = require("../entities/context_token.entity");
var id_token_entity_1 = require("../entities/id_token.entity");
var key_entity_1 = require("../entities/key.entity");
var nonce_entity_1 = require("../entities/nonce.entity");
var state_entity_1 = require("../entities/state.entity");
var types_1 = require("./types");
var Database = (function () {
    function Database() {
        return Database.instance;
    }
    Object.defineProperty(Database, "dataSource", {
        get: function () {
            if (!this._dataSource.isInitialized)
                throw new Error('DataSource is uninitialized');
            return this._dataSource;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Database.prototype, "dataSource", {
        get: function () {
            return Database.dataSource;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Database.prototype, "encryptionKey", {
        get: function () {
            return Database.encryptionKey;
        },
        enumerable: false,
        configurable: true
    });
    Database.initializeDatabase = function (options, encryptionKey) {
        return __awaiter(this, void 0, void 0, function () {
            var entities;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.instance) {
                            return [2, this.instance];
                        }
                        entities = [
                            access_token_entity_1.AccessTokenModel,
                            context_token_entity_1.ContextTokenModel,
                            id_token_entity_1.IdTokenModel,
                            key_entity_1.PublicKeyModel,
                            key_entity_1.PrivateKeyModel,
                            nonce_entity_1.NonceModel,
                            platform_entity_1.PlatformModel,
                            state_entity_1.StateModel,
                        ];
                        this.encryptionKey = encryptionKey;
                        this.instance = new Database();
                        this._dataSource = new typeorm_1.DataSource(__assign({ entities: entities }, options));
                        return [4, this._dataSource.initialize()];
                    case 1:
                        _a.sent();
                        return [4, this._dataSource.synchronize(false)];
                    case 2:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    Database.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._dataSource.isInitialized) return [3, 2];
                        return [4, this._dataSource.destroy()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2];
                }
            });
        });
    };
    Database.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.dataSource.destroy()];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    Database.prototype.decryptRecord = function (record) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _a = [__assign({}, record)];
                        _d = {};
                        _c = (_b = JSON).parse;
                        return [4, this.decrypt(record.data, record.iv)];
                    case 1: return [2, __assign.apply(void 0, _a.concat([(_d.data = _c.apply(_b, [_e.sent()]), _d)]))];
                }
            });
        });
    };
    Database.find = function (type, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.instance.find(type, options)];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    Database.prototype.find = function (type, options) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.dataSource.getRepository(type).find(options)];
                    case 1:
                        result = _a.sent();
                        return [4, Promise.all(result.map(function (record) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!(record instanceof types_1.EncryptedEntity)) return [3, 2];
                                            return [4, this.decryptRecord(record)];
                                        case 1: return [2, _a.sent()];
                                        case 2: return [2, record];
                                    }
                                });
                            }); }))];
                    case 2: return [2, _a.sent()];
                }
            });
        });
    };
    Database.findOne = function (type, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.instance.findOne(type, options)];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    Database.prototype.findOne = function (type, options) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.dataSource.getRepository(type).findOne(options)];
                    case 1:
                        result = _a.sent();
                        if (!result) {
                            return [2, undefined];
                        }
                        if (!(result instanceof types_1.EncryptedEntity)) return [3, 3];
                        return [4, this.decryptRecord(result)];
                    case 2: return [2, _a.sent()];
                    case 3: return [2, result];
                }
            });
        });
    };
    Database.save = function (type, params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.instance.save(type, params)];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    Database.prototype.save = function (type, params) {
        return __awaiter(this, void 0, void 0, function () {
            var encrypted;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!('data' in params)) return [3, 2];
                        return [4, this.encrypt(JSON.stringify(params.data))];
                    case 1:
                        encrypted = _a.sent();
                        params = __assign(__assign({}, params), { iv: encrypted.iv, data: encrypted.data });
                        _a.label = 2;
                    case 2: return [4, this.dataSource.getRepository(type).save(params)];
                    case 3: return [2, _a.sent()];
                }
            });
        });
    };
    Database.update = function (type, params, where) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.instance.update(type, params, where)];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    Database.prototype.update = function (type, params, where) {
        return __awaiter(this, void 0, void 0, function () {
            var encrypted;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!('data' in params)) return [3, 2];
                        return [4, this.encrypt(JSON.stringify(params.data))];
                    case 1:
                        encrypted = _a.sent();
                        params = __assign(__assign({}, params), { iv: encrypted.iv, data: encrypted.data });
                        _a.label = 2;
                    case 2: return [4, this.dataSource.getRepository(type).update(where, params)];
                    case 3: return [2, _a.sent()];
                }
            });
        });
    };
    Database.delete = function (type, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.instance.delete(type, options)];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    Database.prototype.delete = function (type, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.dataSource.getRepository(type).delete(options)];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    Database.prototype.encrypt = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, key, iv, cipher, encrypted;
            return __generator(this, function (_a) {
                hash = crypto.createHash('sha256');
                hash.update(this.encryptionKey);
                key = hash.digest().slice(0, 32);
                iv = crypto.randomBytes(16);
                cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
                encrypted = cipher.update(data);
                encrypted = Buffer.concat([encrypted, cipher.final()]);
                return [2, { iv: iv.toString('hex'), data: encrypted.toString('hex') }];
            });
        });
    };
    Database.prototype.decrypt = function (data, iv) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, key, newIv, encryptedText, decipher, decrypted;
            return __generator(this, function (_a) {
                hash = crypto.createHash('sha256');
                hash.update(this.encryptionKey);
                key = hash.digest().slice(0, 32);
                newIv = Buffer.from(iv, 'hex');
                encryptedText = Buffer.from(data, 'hex');
                decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), newIv);
                decrypted = decipher.update(encryptedText);
                decrypted = Buffer.concat([decrypted, decipher.final()]);
                return [2, decrypted.toString()];
            });
        });
    };
    return Database;
}());
exports.Database = Database;
