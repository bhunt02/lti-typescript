"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Keyset = void 0;
/* Handle jwk keyset generation */
const database_1 = require("./database");
const key_entity_1 = require("../entities/key.entity");
const debug_1 = require("./debug");
const Jwk = require("rasha");
class Keyset {
    /**
     * @description Handles the creation of jwk keyset.
     */
    static async build() {
        debug_1.Debug.log(this, 'Generating JWK keyset');
        const keys = await database_1.Database.find(key_entity_1.PublicKeyModel);
        const keyset = { keys: [] };
        for (const key of keys) {
            const jwk = await Jwk.import({
                pem: key.data.key,
            });
            jwk.kid = key.kid;
            jwk.alg = 'RS256';
            jwk.use = 'sig';
            keyset.keys.push(jwk);
        }
        return keyset;
    }
}
exports.Keyset = Keyset;
//# sourceMappingURL=keyset.js.map