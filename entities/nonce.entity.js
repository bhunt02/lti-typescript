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
exports.NonceModel = void 0;
const typeorm_1 = require("typeorm");
let NonceModel = class NonceModel extends typeorm_1.BaseEntity {
};
exports.NonceModel = NonceModel;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'text' }),
    __metadata("design:type", String)
], NonceModel.prototype, "nonce", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], NonceModel.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 10 }),
    __metadata("design:type", Number)
], NonceModel.prototype, "expiresAt", void 0);
exports.NonceModel = NonceModel = __decorate([
    (0, typeorm_1.Entity)('nonce_model')
], NonceModel);
//# sourceMappingURL=nonce.entity.js.map