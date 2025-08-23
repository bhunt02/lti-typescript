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
exports.IdTokenModel = void 0;
const typeorm_1 = require("typeorm");
const platform_entity_1 = require("./platform.entity");
let IdTokenModel = class IdTokenModel extends typeorm_1.BaseEntity {
};
exports.IdTokenModel = IdTokenModel;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'text' }),
    __metadata("design:type", String)
], IdTokenModel.prototype, "iss", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'text' }),
    __metadata("design:type", String)
], IdTokenModel.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], IdTokenModel.prototype, "userInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], IdTokenModel.prototype, "platformInfo", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'text' }),
    __metadata("design:type", String)
], IdTokenModel.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], IdTokenModel.prototype, "platformId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'text' }),
    __metadata("design:type", String)
], IdTokenModel.prototype, "deploymentId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], IdTokenModel.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 3600 * 24 }),
    __metadata("design:type", Number)
], IdTokenModel.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => platform_entity_1.PlatformModel, (platform) => platform.idTokens, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)([
        { name: 'iss', referencedColumnName: 'platformUrl' },
        { name: 'clientId', referencedColumnName: 'clientId' },
    ]),
    __metadata("design:type", platform_entity_1.PlatformModel)
], IdTokenModel.prototype, "platform", void 0);
exports.IdTokenModel = IdTokenModel = __decorate([
    (0, typeorm_1.Entity)('id_token_model')
], IdTokenModel);
//# sourceMappingURL=id_token.entity.js.map