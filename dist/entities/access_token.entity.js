"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessTokenModel = void 0;
const typeorm_1 = require("typeorm");
const types_1 = require("../utils/types");
const platform_entity_1 = require("./platform.entity");
let AccessTokenModel = class AccessTokenModel extends types_1.EncryptedEntity {
};
exports.AccessTokenModel = AccessTokenModel;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'text' }),
    __metadata("design:type", String)
], AccessTokenModel.prototype, "platformUrl", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'text' }),
    __metadata("design:type", String)
], AccessTokenModel.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'text' }),
    __metadata("design:type", String)
], AccessTokenModel.prototype, "scopes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], AccessTokenModel.prototype, "iv", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], AccessTokenModel.prototype, "data", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], AccessTokenModel.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 3600 }),
    __metadata("design:type", Number)
], AccessTokenModel.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => platform_entity_1.PlatformModel, (platform) => platform.accessTokens, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)([
        { name: 'platformUrl', referencedColumnName: 'platformUrl' },
        { name: 'clientId', referencedColumnName: 'clientId' },
    ]),
    __metadata("design:type", platform_entity_1.PlatformModel)
], AccessTokenModel.prototype, "platform", void 0);
exports.AccessTokenModel = AccessTokenModel = __decorate([
    (0, typeorm_1.Entity)('access_token_model')
], AccessTokenModel);
//# sourceMappingURL=access_token.entity.js.map