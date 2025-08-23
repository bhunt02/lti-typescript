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
exports.StateModel = void 0;
const typeorm_1 = require("typeorm");
let StateModel = class StateModel extends typeorm_1.BaseEntity {
};
exports.StateModel = StateModel;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'text' }),
    __metadata("design:type", String)
], StateModel.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], StateModel.prototype, "query", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], StateModel.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 10 }),
    __metadata("design:type", Number)
], StateModel.prototype, "expiresAt", void 0);
exports.StateModel = StateModel = __decorate([
    (0, typeorm_1.Entity)('state_model')
], StateModel);
//# sourceMappingURL=state.entity.js.map