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
exports.PrivateKeyModel = exports.PublicKeyModel = exports.KeyModel = void 0;
const typeorm_1 = require("typeorm");
const types_1 = require("../utils/types");
const platform_entity_1 = require("./platform.entity");
let KeyModel = class KeyModel extends types_1.EncryptedEntity {
};
exports.KeyModel = KeyModel;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'text' }),
    __metadata("design:type", String)
], KeyModel.prototype, "kid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], KeyModel.prototype, "platformUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], KeyModel.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], KeyModel.prototype, "iv", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], KeyModel.prototype, "data", void 0);
exports.KeyModel = KeyModel = __decorate([
    (0, typeorm_1.Entity)('key_model')
], KeyModel);
let PublicKeyModel = class PublicKeyModel extends KeyModel {
};
exports.PublicKeyModel = PublicKeyModel;
__decorate([
    (0, typeorm_1.OneToOne)(() => platform_entity_1.PlatformModel, (platform) => platform.publicKey, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)([{ name: 'kid', referencedColumnName: 'kid' }]),
    __metadata("design:type", platform_entity_1.PlatformModel)
], PublicKeyModel.prototype, "platform", void 0);
exports.PublicKeyModel = PublicKeyModel = __decorate([
    (0, typeorm_1.Entity)('public_key_model')
], PublicKeyModel);
let PrivateKeyModel = class PrivateKeyModel extends KeyModel {
};
exports.PrivateKeyModel = PrivateKeyModel;
__decorate([
    (0, typeorm_1.OneToOne)(() => platform_entity_1.PlatformModel, (platform) => platform.privateKey, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)([
        { name: 'kid', referencedColumnName: 'kid' },
        { name: 'platformUrl', referencedColumnName: 'platformUrl' },
        { name: 'clientId', referencedColumnName: 'clientId' },
    ]),
    __metadata("design:type", platform_entity_1.PlatformModel)
], PrivateKeyModel.prototype, "platform", void 0);
exports.PrivateKeyModel = PrivateKeyModel = __decorate([
    (0, typeorm_1.Entity)('private_key_model')
], PrivateKeyModel);
//# sourceMappingURL=key.entity.js.map