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
exports.PlatformModel = void 0;
const typeorm_1 = require("typeorm");
const types_1 = require("../utils/types");
const access_token_entity_1 = require("./access_token.entity");
const id_token_entity_1 = require("./id_token.entity");
const key_entity_1 = require("./key.entity");
let PlatformModel = class PlatformModel extends typeorm_1.BaseEntity {
    authToken() {
        return {
            method: this.authTokenMethod,
            key: this.authTokenKey,
        };
    }
};
exports.PlatformModel = PlatformModel;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'text' }),
    __metadata("design:type", String)
], PlatformModel.prototype, "kid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], PlatformModel.prototype, "platformUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], PlatformModel.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], PlatformModel.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], PlatformModel.prototype, "authenticationEndpoint", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], PlatformModel.prototype, "accessTokenEndpoint", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PlatformModel.prototype, "authorizationServer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: types_1.AuthTokenMethodEnum, default: 'JWK_SET' }),
    __metadata("design:type", String)
], PlatformModel.prototype, "authTokenMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], PlatformModel.prototype, "authTokenKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PlatformModel.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PlatformModel.prototype, "dynamicallyRegistered", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PlatformModel.prototype, "registrationEndpoint", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => access_token_entity_1.AccessTokenModel, (accessToken) => accessToken.platform),
    __metadata("design:type", Array)
], PlatformModel.prototype, "accessTokens", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => id_token_entity_1.IdTokenModel, (idToken) => idToken.platform),
    __metadata("design:type", Array)
], PlatformModel.prototype, "idTokens", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => key_entity_1.PublicKeyModel, (pubk) => pubk.platform),
    __metadata("design:type", key_entity_1.PublicKeyModel)
], PlatformModel.prototype, "publicKey", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => key_entity_1.PrivateKeyModel, (prvk) => prvk.platform),
    __metadata("design:type", key_entity_1.PrivateKeyModel)
], PlatformModel.prototype, "privateKey", void 0);
exports.PlatformModel = PlatformModel = __decorate([
    (0, typeorm_1.Entity)('platform_model'),
    (0, typeorm_1.Unique)(['platformUrl', 'clientId']),
    (0, typeorm_1.Unique)(['platformUrl', 'clientId', 'kid'])
], PlatformModel);
//# sourceMappingURL=platform.entity.js.map