"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = register;
require("reflect-metadata");
const provider_1 = require("./provider/provider");
async function register(encryptionKey, databaseOptions, options) {
    const provider = new provider_1.Provider();
    await provider.setup(encryptionKey, databaseOptions, options);
    return provider;
}
//# sourceMappingURL=main.js.map