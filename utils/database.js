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
    /**
     * @desc Returns the active DataSource object which represents the connection to the database
     */
    get dataSource() {
        return Database.dataSource;
    }
    get encryptionKey() {
        return Database.encryptionKey;
    }
    /**
     * @desc Initializes connection to the database with TypeORM.
     * @param options Database connection options. Overwrite 'Entities' to use customized entities that are supported by the database of your choosing. Default entities support PostgreSQL database.
     * @param encryptionKey The encryption key used for encrypting/decrypting certain data
     * @param synchronize Whether to drop tables and recreate schema on startup (default: false)
     */
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
            entities, // Allows overwrite of entities
            ...options,
        });
        await this._dataSource.initialize();
        await this._dataSource.synchronize(synchronize);
    }
    /**
     * @description Closes connection with the database.
     */
    static async close() {
        if (this._dataSource.isInitialized) {
            await this._dataSource.destroy();
        }
    }
    /**
     * @description Closes connection with the database.
     */
    async close() {
        await this.dataSource.destroy();
    }
    async decryptRecord(record) {
        return {
            ...record,
            data: JSON.parse(await this.decrypt(record.data, record.iv)),
        };
    }
    /**
     * @desc Finds entities of the defined type that match given find options.
     * @param type The Entity class type
     * @param options Find options
     */
    static async find(type, options) {
        return await this.instance.find(type, options);
    }
    /**
     * @desc Finds entities of the defined type that match given find options.
     * @param type The Entity class type
     * @param options Find options
     */
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
    /**
     * @desc Finds first entity of the defined type by a given find options. If entity was not found in the database - returns null.
     * @param type The Entity class type
     * @param options Find options
     */
    static async findOne(type, options) {
        return await this.instance.findOne(type, options);
    }
    /**
     * @desc Finds first entity of the defined type by a given find options. If entity was not found in the database - returns null.
     * @param type The Entity class type
     * @param options Find options
     */
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
    /**
     * @desc Saves a given entity of the provided type in the database. If entity does not exist in the database then inserts, otherwise updates.
     * @param type The Entity class type
     * @param params The parameters of the entity to save
     */
    static async save(type, params) {
        return await this.instance.save(type, params);
    }
    /**
     * @desc Saves a given entity of the provided type in the database. If entity does not exist in the database then inserts, otherwise updates.
     * @param type The Entity class type
     * @param params The parameters of the entity to save
     */
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
    /**
     * @desc Updates entity of given type partially. Entity can be found by a given conditions. Unlike save method executes a primitive operation without cascades, relations and other operations included. Executes fast and efficient UPDATE query. Does not check if entity exist in the database.
     * @param type The Entity class type
     * @param params The parameters of the entity to update
     * @param where Options to filter which entities are updated
     */
    static async update(type, params, where) {
        return await this.instance.update(type, params, where);
    }
    /**
     * @desc Updates entity of given type partially. Entity can be found by a given conditions. Unlike save method executes a primitive operation without cascades, relations and other operations included. Executes fast and efficient UPDATE query. Does not check if entity exist in the database.
     * @param type The Entity class type
     * @param params The parameters of the entity to update
     * @param where Options to filter which entities are updated
     */
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
    /**
     * @desc Deletes entities of the provided type by a given criteria. Unlike save method executes a primitive operation without cascades, relations and other operations included. Executes fast and efficient DELETE query. Does not check if entity exist in the database.
     * @param type The Entity class type
     * @param options Filter options for determining which entities to delete
     */
    static async delete(type, options) {
        return await this.instance.delete(type, options);
    }
    /**
     * @desc Deletes entities of the provided type by a given criteria. Unlike save method executes a primitive operation without cascades, relations and other operations included. Executes fast and efficient DELETE query. Does not check if entity exist in the database.
     * @param type The Entity class type
     * @param options Filter options for determining which entities to delete
     */
    async delete(type, options) {
        return await this.dataSource.getRepository(type).delete(options);
    }
    /**
     * @description Encrypts data.
     * @param {String} data - Data to be encrypted
     */
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
    /**
     * @description Decrypts data.
     * @param {String} data - Data to be decrypted
     * @param {String} iv - Encryption iv
     */
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