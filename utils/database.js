"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const typeorm_1 = require("typeorm");
const crypto = require("crypto");
const platform_entity_1 = require("../entities/platform.entity");
const access_token_entity_1 = require("../entities/access_token.entity");
const context_token_entity_1 = require("../entities/context_token.entity");
const id_token_entity_1 = require("../entities/id_token.entity");
const key_entity_1 = require("../entities/key.entity");
const nonce_entity_1 = require("../entities/nonce.entity");
const state_entity_1 = require("../entities/state.entity");
const types_1 = require("./types");
class Database {
    constructor() {
        return Database.instance;
    }
    static get dataSource() {
        if (!this._dataSource.isInitialized)
            throw new Error('DataSource is uninitialized');
        return this._dataSource;
    }
    get dataSource() {
        return Database.dataSource;
    }
    get encryptionKey() {
        return Database.encryptionKey;
    }
    static async initializeDatabase(options, encryptionKey, synchronize = false) {
        if (this.instance) {
            return this.instance;
        }
        const entities = [
            access_token_entity_1.AccessTokenModel,
            context_token_entity_1.ContextTokenModel,
            id_token_entity_1.IdTokenModel,
            key_entity_1.PublicKeyModel,
            key_entity_1.PrivateKeyModel,
            nonce_entity_1.NonceModel,
            platform_entity_1.PlatformModel,
            state_entity_1.StateModel,
        ];
        this.encryptionKey = encryptionKey;
        this.instance = new Database();
        this._dataSource = new typeorm_1.DataSource({
            entities,
            ...options,
        });
        await this._dataSource.initialize();
        await this._dataSource.synchronize(synchronize);
    }
    static async close() {
        if (this._dataSource.isInitialized) {
            await this._dataSource.destroy();
        }
    }
    async close() {
        await this.dataSource.destroy();
    }
    async decryptRecord(record) {
        return {
            ...record,
            data: JSON.parse(await this.decrypt(record.data, record.iv)),
        };
    }
    static async find(type, options) {
        return await this.instance.find(type, options);
    }
    async find(type, options) {
        const result = await this.dataSource.getRepository(type).find(options);
        return await Promise.all(result.map(async (record) => {
            if (record instanceof types_1.EncryptedEntity) {
                return await this.decryptRecord(record);
            }
            else {
                return record;
            }
        }));
    }
    static async findOne(type, options) {
        return await this.instance.findOne(type, options);
    }
    async findOne(type, options) {
        const result = await this.dataSource.getRepository(type).findOne(options);
        if (!result) {
            return undefined;
        }
        if (result instanceof types_1.EncryptedEntity) {
            return await this.decryptRecord(result);
        }
        return result;
    }
    static async save(type, params) {
        return await this.instance.save(type, params);
    }
    async save(type, params) {
        if ('data' in params) {
            const encrypted = await this.encrypt(JSON.stringify(params.data));
            params = {
                ...params,
                iv: encrypted.iv,
                data: encrypted.data,
            };
        }
        return await this.dataSource.getRepository(type).save(params);
    }
    static async update(type, params, where) {
        return await this.instance.update(type, params, where);
    }
    async update(type, params, where) {
        if ('data' in params) {
            const encrypted = await this.encrypt(JSON.stringify(params.data));
            params = {
                ...params,
                iv: encrypted.iv,
                data: encrypted.data,
            };
        }
        return await this.dataSource.getRepository(type).update(where, params);
    }
    static async delete(type, options) {
        return await this.instance.delete(type, options);
    }
    async delete(type, options) {
        return await this.dataSource.getRepository(type).delete(options);
    }
    async encrypt(data) {
        const hash = crypto.createHash('sha256');
        hash.update(this.encryptionKey);
        const key = hash.digest().slice(0, 32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(data);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return { iv: iv.toString('hex'), data: encrypted.toString('hex') };
    }
    async decrypt(data, iv) {
        const hash = crypto.createHash('sha256');
        hash.update(this.encryptionKey);
        const key = hash.digest().slice(0, 32);
        const newIv = Buffer.from(iv, 'hex');
        const encryptedText = Buffer.from(data, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), newIv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
}
exports.Database = Database;
//# sourceMappingURL=database.js.map