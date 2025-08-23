"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformModel = void 0;
var typeorm_1 = require("typeorm");
var types_1 = require("../utils/types");
var access_token_entity_1 = require("./access_token.entity");
var id_token_entity_1 = require("./id_token.entity");
var key_entity_1 = require("./key.entity");
var PlatformModel = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('platform_model'), (0, typeorm_1.Unique)(['platformUrl', 'clientId']), (0, typeorm_1.Unique)(['platformUrl', 'clientId', 'kid'])];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = typeorm_1.BaseEntity;
    var _kid_decorators;
    var _kid_initializers = [];
    var _kid_extraInitializers = [];
    var _platformUrl_decorators;
    var _platformUrl_initializers = [];
    var _platformUrl_extraInitializers = [];
    var _clientId_decorators;
    var _clientId_initializers = [];
    var _clientId_extraInitializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _authenticationEndpoint_decorators;
    var _authenticationEndpoint_initializers = [];
    var _authenticationEndpoint_extraInitializers = [];
    var _accessTokenEndpoint_decorators;
    var _accessTokenEndpoint_initializers = [];
    var _accessTokenEndpoint_extraInitializers = [];
    var _authorizationServer_decorators;
    var _authorizationServer_initializers = [];
    var _authorizationServer_extraInitializers = [];
    var _authTokenMethod_decorators;
    var _authTokenMethod_initializers = [];
    var _authTokenMethod_extraInitializers = [];
    var _authTokenKey_decorators;
    var _authTokenKey_initializers = [];
    var _authTokenKey_extraInitializers = [];
    var _active_decorators;
    var _active_initializers = [];
    var _active_extraInitializers = [];
    var _accessTokens_decorators;
    var _accessTokens_initializers = [];
    var _accessTokens_extraInitializers = [];
    var _idTokens_decorators;
    var _idTokens_initializers = [];
    var _idTokens_extraInitializers = [];
    var _publicKey_decorators;
    var _publicKey_initializers = [];
    var _publicKey_extraInitializers = [];
    var _privateKey_decorators;
    var _privateKey_initializers = [];
    var _privateKey_extraInitializers = [];
    var PlatformModel = _classThis = (function (_super) {
        __extends(PlatformModel_1, _super);
        function PlatformModel_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.kid = __runInitializers(_this, _kid_initializers, void 0);
            _this.platformUrl = (__runInitializers(_this, _kid_extraInitializers), __runInitializers(_this, _platformUrl_initializers, void 0));
            _this.clientId = (__runInitializers(_this, _platformUrl_extraInitializers), __runInitializers(_this, _clientId_initializers, void 0));
            _this.name = (__runInitializers(_this, _clientId_extraInitializers), __runInitializers(_this, _name_initializers, void 0));
            _this.authenticationEndpoint = (__runInitializers(_this, _name_extraInitializers), __runInitializers(_this, _authenticationEndpoint_initializers, void 0));
            _this.accessTokenEndpoint = (__runInitializers(_this, _authenticationEndpoint_extraInitializers), __runInitializers(_this, _accessTokenEndpoint_initializers, void 0));
            _this.authorizationServer = (__runInitializers(_this, _accessTokenEndpoint_extraInitializers), __runInitializers(_this, _authorizationServer_initializers, void 0));
            _this.authTokenMethod = (__runInitializers(_this, _authorizationServer_extraInitializers), __runInitializers(_this, _authTokenMethod_initializers, void 0));
            _this.authTokenKey = (__runInitializers(_this, _authTokenMethod_extraInitializers), __runInitializers(_this, _authTokenKey_initializers, void 0));
            _this.active = (__runInitializers(_this, _authTokenKey_extraInitializers), __runInitializers(_this, _active_initializers, void 0));
            _this.accessTokens = (__runInitializers(_this, _active_extraInitializers), __runInitializers(_this, _accessTokens_initializers, void 0));
            _this.idTokens = (__runInitializers(_this, _accessTokens_extraInitializers), __runInitializers(_this, _idTokens_initializers, void 0));
            _this.publicKey = (__runInitializers(_this, _idTokens_extraInitializers), __runInitializers(_this, _publicKey_initializers, void 0));
            _this.privateKey = (__runInitializers(_this, _publicKey_extraInitializers), __runInitializers(_this, _privateKey_initializers, void 0));
            __runInitializers(_this, _privateKey_extraInitializers);
            return _this;
        }
        PlatformModel_1.prototype.authToken = function () {
            return {
                method: this.authTokenMethod,
                key: this.authTokenKey,
            };
        };
        return PlatformModel_1;
    }(_classSuper));
    __setFunctionName(_classThis, "PlatformModel");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _kid_decorators = [(0, typeorm_1.PrimaryColumn)({ type: 'text' })];
        _platformUrl_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _clientId_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _name_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _authenticationEndpoint_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _accessTokenEndpoint_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _authorizationServer_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _authTokenMethod_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: types_1.AuthTokenMethodEnum, default: 'JWK_SET' })];
        _authTokenKey_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _active_decorators = [(0, typeorm_1.Column)({ type: 'boolean', default: false })];
        _accessTokens_decorators = [(0, typeorm_1.OneToMany)(function () { return access_token_entity_1.AccessTokenModel; }, function (accessToken) { return accessToken.platform; })];
        _idTokens_decorators = [(0, typeorm_1.OneToMany)(function () { return id_token_entity_1.IdTokenModel; }, function (idToken) { return idToken.platform; })];
        _publicKey_decorators = [(0, typeorm_1.OneToOne)(function () { return key_entity_1.PublicKeyModel; }, function (pubk) { return pubk.platform; })];
        _privateKey_decorators = [(0, typeorm_1.OneToOne)(function () { return key_entity_1.PrivateKeyModel; }, function (prvk) { return prvk.platform; })];
        __esDecorate(null, null, _kid_decorators, { kind: "field", name: "kid", static: false, private: false, access: { has: function (obj) { return "kid" in obj; }, get: function (obj) { return obj.kid; }, set: function (obj, value) { obj.kid = value; } }, metadata: _metadata }, _kid_initializers, _kid_extraInitializers);
        __esDecorate(null, null, _platformUrl_decorators, { kind: "field", name: "platformUrl", static: false, private: false, access: { has: function (obj) { return "platformUrl" in obj; }, get: function (obj) { return obj.platformUrl; }, set: function (obj, value) { obj.platformUrl = value; } }, metadata: _metadata }, _platformUrl_initializers, _platformUrl_extraInitializers);
        __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: function (obj) { return "clientId" in obj; }, get: function (obj) { return obj.clientId; }, set: function (obj, value) { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
        __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
        __esDecorate(null, null, _authenticationEndpoint_decorators, { kind: "field", name: "authenticationEndpoint", static: false, private: false, access: { has: function (obj) { return "authenticationEndpoint" in obj; }, get: function (obj) { return obj.authenticationEndpoint; }, set: function (obj, value) { obj.authenticationEndpoint = value; } }, metadata: _metadata }, _authenticationEndpoint_initializers, _authenticationEndpoint_extraInitializers);
        __esDecorate(null, null, _accessTokenEndpoint_decorators, { kind: "field", name: "accessTokenEndpoint", static: false, private: false, access: { has: function (obj) { return "accessTokenEndpoint" in obj; }, get: function (obj) { return obj.accessTokenEndpoint; }, set: function (obj, value) { obj.accessTokenEndpoint = value; } }, metadata: _metadata }, _accessTokenEndpoint_initializers, _accessTokenEndpoint_extraInitializers);
        __esDecorate(null, null, _authorizationServer_decorators, { kind: "field", name: "authorizationServer", static: false, private: false, access: { has: function (obj) { return "authorizationServer" in obj; }, get: function (obj) { return obj.authorizationServer; }, set: function (obj, value) { obj.authorizationServer = value; } }, metadata: _metadata }, _authorizationServer_initializers, _authorizationServer_extraInitializers);
        __esDecorate(null, null, _authTokenMethod_decorators, { kind: "field", name: "authTokenMethod", static: false, private: false, access: { has: function (obj) { return "authTokenMethod" in obj; }, get: function (obj) { return obj.authTokenMethod; }, set: function (obj, value) { obj.authTokenMethod = value; } }, metadata: _metadata }, _authTokenMethod_initializers, _authTokenMethod_extraInitializers);
        __esDecorate(null, null, _authTokenKey_decorators, { kind: "field", name: "authTokenKey", static: false, private: false, access: { has: function (obj) { return "authTokenKey" in obj; }, get: function (obj) { return obj.authTokenKey; }, set: function (obj, value) { obj.authTokenKey = value; } }, metadata: _metadata }, _authTokenKey_initializers, _authTokenKey_extraInitializers);
        __esDecorate(null, null, _active_decorators, { kind: "field", name: "active", static: false, private: false, access: { has: function (obj) { return "active" in obj; }, get: function (obj) { return obj.active; }, set: function (obj, value) { obj.active = value; } }, metadata: _metadata }, _active_initializers, _active_extraInitializers);
        __esDecorate(null, null, _accessTokens_decorators, { kind: "field", name: "accessTokens", static: false, private: false, access: { has: function (obj) { return "accessTokens" in obj; }, get: function (obj) { return obj.accessTokens; }, set: function (obj, value) { obj.accessTokens = value; } }, metadata: _metadata }, _accessTokens_initializers, _accessTokens_extraInitializers);
        __esDecorate(null, null, _idTokens_decorators, { kind: "field", name: "idTokens", static: false, private: false, access: { has: function (obj) { return "idTokens" in obj; }, get: function (obj) { return obj.idTokens; }, set: function (obj, value) { obj.idTokens = value; } }, metadata: _metadata }, _idTokens_initializers, _idTokens_extraInitializers);
        __esDecorate(null, null, _publicKey_decorators, { kind: "field", name: "publicKey", static: false, private: false, access: { has: function (obj) { return "publicKey" in obj; }, get: function (obj) { return obj.publicKey; }, set: function (obj, value) { obj.publicKey = value; } }, metadata: _metadata }, _publicKey_initializers, _publicKey_extraInitializers);
        __esDecorate(null, null, _privateKey_decorators, { kind: "field", name: "privateKey", static: false, private: false, access: { has: function (obj) { return "privateKey" in obj; }, get: function (obj) { return obj.privateKey; }, set: function (obj, value) { obj.privateKey = value; } }, metadata: _metadata }, _privateKey_initializers, _privateKey_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PlatformModel = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PlatformModel = _classThis;
}();
exports.PlatformModel = PlatformModel;
