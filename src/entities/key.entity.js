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
exports.PrivateKeyModel = exports.PublicKeyModel = exports.KeyModel = void 0;
var typeorm_1 = require("typeorm");
var types_1 = require("../utils/types");
var platform_entity_1 = require("./platform.entity");
var KeyModel = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('key_model')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = types_1.EncryptedEntity;
    var _kid_decorators;
    var _kid_initializers = [];
    var _kid_extraInitializers = [];
    var _platformUrl_decorators;
    var _platformUrl_initializers = [];
    var _platformUrl_extraInitializers = [];
    var _clientId_decorators;
    var _clientId_initializers = [];
    var _clientId_extraInitializers = [];
    var _iv_decorators;
    var _iv_initializers = [];
    var _iv_extraInitializers = [];
    var _data_decorators;
    var _data_initializers = [];
    var _data_extraInitializers = [];
    var KeyModel = _classThis = (function (_super) {
        __extends(KeyModel_1, _super);
        function KeyModel_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.kid = __runInitializers(_this, _kid_initializers, void 0);
            _this.platformUrl = (__runInitializers(_this, _kid_extraInitializers), __runInitializers(_this, _platformUrl_initializers, void 0));
            _this.clientId = (__runInitializers(_this, _platformUrl_extraInitializers), __runInitializers(_this, _clientId_initializers, void 0));
            _this.iv = (__runInitializers(_this, _clientId_extraInitializers), __runInitializers(_this, _iv_initializers, void 0));
            _this.data = (__runInitializers(_this, _iv_extraInitializers), __runInitializers(_this, _data_initializers, void 0));
            __runInitializers(_this, _data_extraInitializers);
            return _this;
        }
        return KeyModel_1;
    }(_classSuper));
    __setFunctionName(_classThis, "KeyModel");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _kid_decorators = [(0, typeorm_1.PrimaryColumn)({ type: 'text' })];
        _platformUrl_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _clientId_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _iv_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _data_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        __esDecorate(null, null, _kid_decorators, { kind: "field", name: "kid", static: false, private: false, access: { has: function (obj) { return "kid" in obj; }, get: function (obj) { return obj.kid; }, set: function (obj, value) { obj.kid = value; } }, metadata: _metadata }, _kid_initializers, _kid_extraInitializers);
        __esDecorate(null, null, _platformUrl_decorators, { kind: "field", name: "platformUrl", static: false, private: false, access: { has: function (obj) { return "platformUrl" in obj; }, get: function (obj) { return obj.platformUrl; }, set: function (obj, value) { obj.platformUrl = value; } }, metadata: _metadata }, _platformUrl_initializers, _platformUrl_extraInitializers);
        __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: function (obj) { return "clientId" in obj; }, get: function (obj) { return obj.clientId; }, set: function (obj, value) { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
        __esDecorate(null, null, _iv_decorators, { kind: "field", name: "iv", static: false, private: false, access: { has: function (obj) { return "iv" in obj; }, get: function (obj) { return obj.iv; }, set: function (obj, value) { obj.iv = value; } }, metadata: _metadata }, _iv_initializers, _iv_extraInitializers);
        __esDecorate(null, null, _data_decorators, { kind: "field", name: "data", static: false, private: false, access: { has: function (obj) { return "data" in obj; }, get: function (obj) { return obj.data; }, set: function (obj, value) { obj.data = value; } }, metadata: _metadata }, _data_initializers, _data_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        KeyModel = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return KeyModel = _classThis;
}();
exports.KeyModel = KeyModel;
var PublicKeyModel = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('public_key_model')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = KeyModel;
    var _platform_decorators;
    var _platform_initializers = [];
    var _platform_extraInitializers = [];
    var PublicKeyModel = _classThis = (function (_super) {
        __extends(PublicKeyModel_1, _super);
        function PublicKeyModel_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.platform = __runInitializers(_this, _platform_initializers, void 0);
            __runInitializers(_this, _platform_extraInitializers);
            return _this;
        }
        return PublicKeyModel_1;
    }(_classSuper));
    __setFunctionName(_classThis, "PublicKeyModel");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _platform_decorators = [(0, typeorm_1.OneToOne)(function () { return platform_entity_1.PlatformModel; }, function (platform) { return platform.publicKey; }, {
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }), (0, typeorm_1.JoinColumn)([{ name: 'kid', referencedColumnName: 'kid' }])];
        __esDecorate(null, null, _platform_decorators, { kind: "field", name: "platform", static: false, private: false, access: { has: function (obj) { return "platform" in obj; }, get: function (obj) { return obj.platform; }, set: function (obj, value) { obj.platform = value; } }, metadata: _metadata }, _platform_initializers, _platform_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PublicKeyModel = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PublicKeyModel = _classThis;
}();
exports.PublicKeyModel = PublicKeyModel;
var PrivateKeyModel = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('private_key_model')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = KeyModel;
    var _platform_decorators;
    var _platform_initializers = [];
    var _platform_extraInitializers = [];
    var PrivateKeyModel = _classThis = (function (_super) {
        __extends(PrivateKeyModel_1, _super);
        function PrivateKeyModel_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.platform = __runInitializers(_this, _platform_initializers, void 0);
            __runInitializers(_this, _platform_extraInitializers);
            return _this;
        }
        return PrivateKeyModel_1;
    }(_classSuper));
    __setFunctionName(_classThis, "PrivateKeyModel");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _platform_decorators = [(0, typeorm_1.OneToOne)(function () { return platform_entity_1.PlatformModel; }, function (platform) { return platform.privateKey; }, {
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }), (0, typeorm_1.JoinColumn)([
                { name: 'kid', referencedColumnName: 'kid' },
                { name: 'platformUrl', referencedColumnName: 'platformUrl' },
                { name: 'clientId', referencedColumnName: 'clientId' },
            ])];
        __esDecorate(null, null, _platform_decorators, { kind: "field", name: "platform", static: false, private: false, access: { has: function (obj) { return "platform" in obj; }, get: function (obj) { return obj.platform; }, set: function (obj, value) { obj.platform = value; } }, metadata: _metadata }, _platform_initializers, _platform_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PrivateKeyModel = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PrivateKeyModel = _classThis;
}();
exports.PrivateKeyModel = PrivateKeyModel;
