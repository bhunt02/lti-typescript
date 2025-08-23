"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptedEntity = exports.AuthTokenMethodEnum = void 0;
const typeorm_1 = require("typeorm");
var AuthTokenMethodEnum;
(function (AuthTokenMethodEnum) {
    AuthTokenMethodEnum["RSA_KEY"] = "RSA_KEY";
    AuthTokenMethodEnum["JWK_KEY"] = "JWK_KEY";
    AuthTokenMethodEnum["JWK_SET"] = "JWK_SET";
})(AuthTokenMethodEnum || (exports.AuthTokenMethodEnum = AuthTokenMethodEnum = {}));
class EncryptedEntity extends typeorm_1.BaseEntity {
}
exports.EncryptedEntity = EncryptedEntity;
//# sourceMappingURL=types.js.map