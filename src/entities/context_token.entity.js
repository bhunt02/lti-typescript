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
exports.ContextTokenModel = void 0;
var typeorm_1 = require("typeorm");
var ContextTokenModel = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('context_token_model')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = typeorm_1.BaseEntity;
    var _contextId_decorators;
    var _contextId_initializers = [];
    var _contextId_extraInitializers = [];
    var _user_decorators;
    var _user_initializers = [];
    var _user_extraInitializers = [];
    var _roles_decorators;
    var _roles_initializers = [];
    var _roles_extraInitializers = [];
    var _path_decorators;
    var _path_initializers = [];
    var _path_extraInitializers = [];
    var _targetLinkUri_decorators;
    var _targetLinkUri_initializers = [];
    var _targetLinkUri_extraInitializers = [];
    var _resource_decorators;
    var _resource_initializers = [];
    var _resource_extraInitializers = [];
    var _context_decorators;
    var _context_initializers = [];
    var _context_extraInitializers = [];
    var _custom_decorators;
    var _custom_initializers = [];
    var _custom_extraInitializers = [];
    var _launchPresentation_decorators;
    var _launchPresentation_initializers = [];
    var _launchPresentation_extraInitializers = [];
    var _messageType_decorators;
    var _messageType_initializers = [];
    var _messageType_extraInitializers = [];
    var _version_decorators;
    var _version_initializers = [];
    var _version_extraInitializers = [];
    var _deepLinkingSettings_decorators;
    var _deepLinkingSettings_initializers = [];
    var _deepLinkingSettings_extraInitializers = [];
    var _lis_decorators;
    var _lis_initializers = [];
    var _lis_extraInitializers = [];
    var _endpoint_decorators;
    var _endpoint_initializers = [];
    var _endpoint_extraInitializers = [];
    var _namesRoles_decorators;
    var _namesRoles_initializers = [];
    var _namesRoles_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _expiresAt_decorators;
    var _expiresAt_initializers = [];
    var _expiresAt_extraInitializers = [];
    var ContextTokenModel = _classThis = (function (_super) {
        __extends(ContextTokenModel_1, _super);
        function ContextTokenModel_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.contextId = __runInitializers(_this, _contextId_initializers, void 0);
            _this.user = (__runInitializers(_this, _contextId_extraInitializers), __runInitializers(_this, _user_initializers, void 0));
            _this.roles = (__runInitializers(_this, _user_extraInitializers), __runInitializers(_this, _roles_initializers, void 0));
            _this.path = (__runInitializers(_this, _roles_extraInitializers), __runInitializers(_this, _path_initializers, void 0));
            _this.targetLinkUri = (__runInitializers(_this, _path_extraInitializers), __runInitializers(_this, _targetLinkUri_initializers, void 0));
            _this.resource = (__runInitializers(_this, _targetLinkUri_extraInitializers), __runInitializers(_this, _resource_initializers, void 0));
            _this.context = (__runInitializers(_this, _resource_extraInitializers), __runInitializers(_this, _context_initializers, void 0));
            _this.custom = (__runInitializers(_this, _context_extraInitializers), __runInitializers(_this, _custom_initializers, void 0));
            _this.launchPresentation = (__runInitializers(_this, _custom_extraInitializers), __runInitializers(_this, _launchPresentation_initializers, void 0));
            _this.messageType = (__runInitializers(_this, _launchPresentation_extraInitializers), __runInitializers(_this, _messageType_initializers, void 0));
            _this.version = (__runInitializers(_this, _messageType_extraInitializers), __runInitializers(_this, _version_initializers, void 0));
            _this.deepLinkingSettings = (__runInitializers(_this, _version_extraInitializers), __runInitializers(_this, _deepLinkingSettings_initializers, void 0));
            _this.lis = (__runInitializers(_this, _deepLinkingSettings_extraInitializers), __runInitializers(_this, _lis_initializers, void 0));
            _this.endpoint = (__runInitializers(_this, _lis_extraInitializers), __runInitializers(_this, _endpoint_initializers, void 0));
            _this.namesRoles = (__runInitializers(_this, _endpoint_extraInitializers), __runInitializers(_this, _namesRoles_initializers, void 0));
            _this.createdAt = (__runInitializers(_this, _namesRoles_extraInitializers), __runInitializers(_this, _createdAt_initializers, void 0));
            _this.expiresAt = (__runInitializers(_this, _createdAt_extraInitializers), __runInitializers(_this, _expiresAt_initializers, void 0));
            __runInitializers(_this, _expiresAt_extraInitializers);
            return _this;
        }
        return ContextTokenModel_1;
    }(_classSuper));
    __setFunctionName(_classThis, "ContextTokenModel");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _contextId_decorators = [(0, typeorm_1.PrimaryColumn)({ type: 'text' })];
        _user_decorators = [(0, typeorm_1.PrimaryColumn)({ type: 'text' })];
        _roles_decorators = [(0, typeorm_1.Column)({ type: 'text', array: true })];
        _path_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _targetLinkUri_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _resource_decorators = [(0, typeorm_1.Column)({ type: 'jsonb' })];
        _context_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', nullable: true })];
        _custom_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', nullable: true })];
        _launchPresentation_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', nullable: true })];
        _messageType_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _version_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _deepLinkingSettings_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', nullable: true })];
        _lis_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', nullable: true })];
        _endpoint_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', nullable: true })];
        _namesRoles_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', nullable: true })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' })];
        _expiresAt_decorators = [(0, typeorm_1.Column)({ type: 'integer', default: 3600 * 24 })];
        __esDecorate(null, null, _contextId_decorators, { kind: "field", name: "contextId", static: false, private: false, access: { has: function (obj) { return "contextId" in obj; }, get: function (obj) { return obj.contextId; }, set: function (obj, value) { obj.contextId = value; } }, metadata: _metadata }, _contextId_initializers, _contextId_extraInitializers);
        __esDecorate(null, null, _user_decorators, { kind: "field", name: "user", static: false, private: false, access: { has: function (obj) { return "user" in obj; }, get: function (obj) { return obj.user; }, set: function (obj, value) { obj.user = value; } }, metadata: _metadata }, _user_initializers, _user_extraInitializers);
        __esDecorate(null, null, _roles_decorators, { kind: "field", name: "roles", static: false, private: false, access: { has: function (obj) { return "roles" in obj; }, get: function (obj) { return obj.roles; }, set: function (obj, value) { obj.roles = value; } }, metadata: _metadata }, _roles_initializers, _roles_extraInitializers);
        __esDecorate(null, null, _path_decorators, { kind: "field", name: "path", static: false, private: false, access: { has: function (obj) { return "path" in obj; }, get: function (obj) { return obj.path; }, set: function (obj, value) { obj.path = value; } }, metadata: _metadata }, _path_initializers, _path_extraInitializers);
        __esDecorate(null, null, _targetLinkUri_decorators, { kind: "field", name: "targetLinkUri", static: false, private: false, access: { has: function (obj) { return "targetLinkUri" in obj; }, get: function (obj) { return obj.targetLinkUri; }, set: function (obj, value) { obj.targetLinkUri = value; } }, metadata: _metadata }, _targetLinkUri_initializers, _targetLinkUri_extraInitializers);
        __esDecorate(null, null, _resource_decorators, { kind: "field", name: "resource", static: false, private: false, access: { has: function (obj) { return "resource" in obj; }, get: function (obj) { return obj.resource; }, set: function (obj, value) { obj.resource = value; } }, metadata: _metadata }, _resource_initializers, _resource_extraInitializers);
        __esDecorate(null, null, _context_decorators, { kind: "field", name: "context", static: false, private: false, access: { has: function (obj) { return "context" in obj; }, get: function (obj) { return obj.context; }, set: function (obj, value) { obj.context = value; } }, metadata: _metadata }, _context_initializers, _context_extraInitializers);
        __esDecorate(null, null, _custom_decorators, { kind: "field", name: "custom", static: false, private: false, access: { has: function (obj) { return "custom" in obj; }, get: function (obj) { return obj.custom; }, set: function (obj, value) { obj.custom = value; } }, metadata: _metadata }, _custom_initializers, _custom_extraInitializers);
        __esDecorate(null, null, _launchPresentation_decorators, { kind: "field", name: "launchPresentation", static: false, private: false, access: { has: function (obj) { return "launchPresentation" in obj; }, get: function (obj) { return obj.launchPresentation; }, set: function (obj, value) { obj.launchPresentation = value; } }, metadata: _metadata }, _launchPresentation_initializers, _launchPresentation_extraInitializers);
        __esDecorate(null, null, _messageType_decorators, { kind: "field", name: "messageType", static: false, private: false, access: { has: function (obj) { return "messageType" in obj; }, get: function (obj) { return obj.messageType; }, set: function (obj, value) { obj.messageType = value; } }, metadata: _metadata }, _messageType_initializers, _messageType_extraInitializers);
        __esDecorate(null, null, _version_decorators, { kind: "field", name: "version", static: false, private: false, access: { has: function (obj) { return "version" in obj; }, get: function (obj) { return obj.version; }, set: function (obj, value) { obj.version = value; } }, metadata: _metadata }, _version_initializers, _version_extraInitializers);
        __esDecorate(null, null, _deepLinkingSettings_decorators, { kind: "field", name: "deepLinkingSettings", static: false, private: false, access: { has: function (obj) { return "deepLinkingSettings" in obj; }, get: function (obj) { return obj.deepLinkingSettings; }, set: function (obj, value) { obj.deepLinkingSettings = value; } }, metadata: _metadata }, _deepLinkingSettings_initializers, _deepLinkingSettings_extraInitializers);
        __esDecorate(null, null, _lis_decorators, { kind: "field", name: "lis", static: false, private: false, access: { has: function (obj) { return "lis" in obj; }, get: function (obj) { return obj.lis; }, set: function (obj, value) { obj.lis = value; } }, metadata: _metadata }, _lis_initializers, _lis_extraInitializers);
        __esDecorate(null, null, _endpoint_decorators, { kind: "field", name: "endpoint", static: false, private: false, access: { has: function (obj) { return "endpoint" in obj; }, get: function (obj) { return obj.endpoint; }, set: function (obj, value) { obj.endpoint = value; } }, metadata: _metadata }, _endpoint_initializers, _endpoint_extraInitializers);
        __esDecorate(null, null, _namesRoles_decorators, { kind: "field", name: "namesRoles", static: false, private: false, access: { has: function (obj) { return "namesRoles" in obj; }, get: function (obj) { return obj.namesRoles; }, set: function (obj, value) { obj.namesRoles = value; } }, metadata: _metadata }, _namesRoles_initializers, _namesRoles_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _expiresAt_decorators, { kind: "field", name: "expiresAt", static: false, private: false, access: { has: function (obj) { return "expiresAt" in obj; }, get: function (obj) { return obj.expiresAt; }, set: function (obj, value) { obj.expiresAt = value; } }, metadata: _metadata }, _expiresAt_initializers, _expiresAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ContextTokenModel = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ContextTokenModel = _classThis;
}();
exports.ContextTokenModel = ContextTokenModel;
