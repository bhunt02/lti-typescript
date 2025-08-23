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
exports.IdTokenModel = void 0;
var typeorm_1 = require("typeorm");
var platform_entity_1 = require("./platform.entity");
var IdTokenModel = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('id_token_model')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = typeorm_1.BaseEntity;
    var _iss_decorators;
    var _iss_initializers = [];
    var _iss_extraInitializers = [];
    var _user_decorators;
    var _user_initializers = [];
    var _user_extraInitializers = [];
    var _userInfo_decorators;
    var _userInfo_initializers = [];
    var _userInfo_extraInitializers = [];
    var _platformInfo_decorators;
    var _platformInfo_initializers = [];
    var _platformInfo_extraInitializers = [];
    var _clientId_decorators;
    var _clientId_initializers = [];
    var _clientId_extraInitializers = [];
    var _platformId_decorators;
    var _platformId_initializers = [];
    var _platformId_extraInitializers = [];
    var _deploymentId_decorators;
    var _deploymentId_initializers = [];
    var _deploymentId_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _expiresAt_decorators;
    var _expiresAt_initializers = [];
    var _expiresAt_extraInitializers = [];
    var _platform_decorators;
    var _platform_initializers = [];
    var _platform_extraInitializers = [];
    var IdTokenModel = _classThis = (function (_super) {
        __extends(IdTokenModel_1, _super);
        function IdTokenModel_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.iss = __runInitializers(_this, _iss_initializers, void 0);
            _this.user = (__runInitializers(_this, _iss_extraInitializers), __runInitializers(_this, _user_initializers, void 0));
            _this.userInfo = (__runInitializers(_this, _user_extraInitializers), __runInitializers(_this, _userInfo_initializers, void 0));
            _this.platformInfo = (__runInitializers(_this, _userInfo_extraInitializers), __runInitializers(_this, _platformInfo_initializers, void 0));
            _this.clientId = (__runInitializers(_this, _platformInfo_extraInitializers), __runInitializers(_this, _clientId_initializers, void 0));
            _this.platformId = (__runInitializers(_this, _clientId_extraInitializers), __runInitializers(_this, _platformId_initializers, void 0));
            _this.deploymentId = (__runInitializers(_this, _platformId_extraInitializers), __runInitializers(_this, _deploymentId_initializers, void 0));
            _this.createdAt = (__runInitializers(_this, _deploymentId_extraInitializers), __runInitializers(_this, _createdAt_initializers, void 0));
            _this.expiresAt = (__runInitializers(_this, _createdAt_extraInitializers), __runInitializers(_this, _expiresAt_initializers, void 0));
            _this.platform = (__runInitializers(_this, _expiresAt_extraInitializers), __runInitializers(_this, _platform_initializers, void 0));
            __runInitializers(_this, _platform_extraInitializers);
            return _this;
        }
        return IdTokenModel_1;
    }(_classSuper));
    __setFunctionName(_classThis, "IdTokenModel");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _iss_decorators = [(0, typeorm_1.PrimaryColumn)({ type: 'text' })];
        _user_decorators = [(0, typeorm_1.PrimaryColumn)({ type: 'text' })];
        _userInfo_decorators = [(0, typeorm_1.Column)({ type: 'jsonb' })];
        _platformInfo_decorators = [(0, typeorm_1.Column)({ type: 'jsonb' })];
        _clientId_decorators = [(0, typeorm_1.PrimaryColumn)({ type: 'text' })];
        _platformId_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _deploymentId_decorators = [(0, typeorm_1.PrimaryColumn)({ type: 'text' })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' })];
        _expiresAt_decorators = [(0, typeorm_1.Column)({ type: 'integer', default: 3600 * 24 })];
        _platform_decorators = [(0, typeorm_1.ManyToOne)(function () { return platform_entity_1.PlatformModel; }, function (platform) { return platform.idTokens; }, {
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }), (0, typeorm_1.JoinColumn)([
                { name: 'iss', referencedColumnName: 'platformUrl' },
                { name: 'clientId', referencedColumnName: 'clientId' },
            ])];
        __esDecorate(null, null, _iss_decorators, { kind: "field", name: "iss", static: false, private: false, access: { has: function (obj) { return "iss" in obj; }, get: function (obj) { return obj.iss; }, set: function (obj, value) { obj.iss = value; } }, metadata: _metadata }, _iss_initializers, _iss_extraInitializers);
        __esDecorate(null, null, _user_decorators, { kind: "field", name: "user", static: false, private: false, access: { has: function (obj) { return "user" in obj; }, get: function (obj) { return obj.user; }, set: function (obj, value) { obj.user = value; } }, metadata: _metadata }, _user_initializers, _user_extraInitializers);
        __esDecorate(null, null, _userInfo_decorators, { kind: "field", name: "userInfo", static: false, private: false, access: { has: function (obj) { return "userInfo" in obj; }, get: function (obj) { return obj.userInfo; }, set: function (obj, value) { obj.userInfo = value; } }, metadata: _metadata }, _userInfo_initializers, _userInfo_extraInitializers);
        __esDecorate(null, null, _platformInfo_decorators, { kind: "field", name: "platformInfo", static: false, private: false, access: { has: function (obj) { return "platformInfo" in obj; }, get: function (obj) { return obj.platformInfo; }, set: function (obj, value) { obj.platformInfo = value; } }, metadata: _metadata }, _platformInfo_initializers, _platformInfo_extraInitializers);
        __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: function (obj) { return "clientId" in obj; }, get: function (obj) { return obj.clientId; }, set: function (obj, value) { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
        __esDecorate(null, null, _platformId_decorators, { kind: "field", name: "platformId", static: false, private: false, access: { has: function (obj) { return "platformId" in obj; }, get: function (obj) { return obj.platformId; }, set: function (obj, value) { obj.platformId = value; } }, metadata: _metadata }, _platformId_initializers, _platformId_extraInitializers);
        __esDecorate(null, null, _deploymentId_decorators, { kind: "field", name: "deploymentId", static: false, private: false, access: { has: function (obj) { return "deploymentId" in obj; }, get: function (obj) { return obj.deploymentId; }, set: function (obj, value) { obj.deploymentId = value; } }, metadata: _metadata }, _deploymentId_initializers, _deploymentId_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _expiresAt_decorators, { kind: "field", name: "expiresAt", static: false, private: false, access: { has: function (obj) { return "expiresAt" in obj; }, get: function (obj) { return obj.expiresAt; }, set: function (obj, value) { obj.expiresAt = value; } }, metadata: _metadata }, _expiresAt_initializers, _expiresAt_extraInitializers);
        __esDecorate(null, null, _platform_decorators, { kind: "field", name: "platform", static: false, private: false, access: { has: function (obj) { return "platform" in obj; }, get: function (obj) { return obj.platform; }, set: function (obj, value) { obj.platform = value; } }, metadata: _metadata }, _platform_initializers, _platform_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        IdTokenModel = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return IdTokenModel = _classThis;
}();
exports.IdTokenModel = IdTokenModel;
