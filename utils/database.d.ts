import { BaseEntity, DataSource, DataSourceOptions, DeepPartial, DeleteResult, EntityTarget, FindManyOptions, FindOneOptions, FindOptionsWhere, UpdateResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
export declare class Database {
    protected constructor();
    private static instance;
    private static encryptionKey;
    static _dataSource: DataSource;
    static get dataSource(): DataSource;
    /**
     * @desc Returns the active DataSource object which represents the connection to the database
     */
    get dataSource(): DataSource;
    private get encryptionKey();
    /**
     * @desc Initializes connection to the database with TypeORM.
     * @param options Database connection options. Overwrite 'Entities' to use customized entities that are supported by the database of your choosing. Default entities support PostgreSQL database.
     * @param encryptionKey The encryption key used for encrypting/decrypting certain data
     * @param synchronize Whether to drop tables and recreate schema on startup (default: false)
     */
    static initializeDatabase(options: DataSourceOptions, encryptionKey: string, synchronize?: boolean): Promise<Database>;
    /**
     * @description Closes connection with the database.
     */
    static close(): Promise<void>;
    /**
     * @description Closes connection with the database.
     */
    close(): Promise<void>;
    private decryptRecord;
    /**
     * @desc Finds entities of the defined type that match given find options.
     * @param type The Entity class type
     * @param options Find options
     */
    static find<T extends BaseEntity>(type: EntityTarget<T>, options?: FindManyOptions<T>): Promise<T[]>;
    /**
     * @desc Finds entities of the defined type that match given find options.
     * @param type The Entity class type
     * @param options Find options
     */
    find<T extends BaseEntity>(type: EntityTarget<T>, options?: FindManyOptions<T>): Promise<T[]>;
    /**
     * @desc Finds first entity of the defined type by a given find options. If entity was not found in the database - returns null.
     * @param type The Entity class type
     * @param options Find options
     */
    static findOne<T extends BaseEntity>(type: EntityTarget<T>, options: FindOneOptions<T>): Promise<T | undefined>;
    /**
     * @desc Finds first entity of the defined type by a given find options. If entity was not found in the database - returns null.
     * @param type The Entity class type
     * @param options Find options
     */
    findOne<T extends BaseEntity>(type: EntityTarget<T>, options: FindOneOptions<T>): Promise<T | undefined>;
    /**
     * @desc Saves a given entity of the provided type in the database. If entity does not exist in the database then inserts, otherwise updates.
     * @param type The Entity class type
     * @param params The parameters of the entity to save
     */
    static save<T extends BaseEntity>(type: EntityTarget<T>, params: DeepPartial<T>): Promise<T>;
    /**
     * @desc Saves a given entity of the provided type in the database. If entity does not exist in the database then inserts, otherwise updates.
     * @param type The Entity class type
     * @param params The parameters of the entity to save
     */
    save<T extends BaseEntity>(type: EntityTarget<T>, params: DeepPartial<T>): Promise<T>;
    /**
     * @desc Updates entity of given type partially. Entity can be found by a given conditions. Unlike save method executes a primitive operation without cascades, relations and other operations included. Executes fast and efficient UPDATE query. Does not check if entity exist in the database.
     * @param type The Entity class type
     * @param params The parameters of the entity to update
     * @param where Options to filter which entities are updated
     */
    static update<T extends BaseEntity>(type: EntityTarget<T>, params: QueryDeepPartialEntity<T>, where: FindOptionsWhere<T>): Promise<UpdateResult>;
    /**
     * @desc Updates entity of given type partially. Entity can be found by a given conditions. Unlike save method executes a primitive operation without cascades, relations and other operations included. Executes fast and efficient UPDATE query. Does not check if entity exist in the database.
     * @param type The Entity class type
     * @param params The parameters of the entity to update
     * @param where Options to filter which entities are updated
     */
    update<T extends BaseEntity>(type: EntityTarget<T>, params: QueryDeepPartialEntity<T>, where: FindOptionsWhere<T>): Promise<UpdateResult>;
    /**
     * @desc Deletes entities of the provided type by a given criteria. Unlike save method executes a primitive operation without cascades, relations and other operations included. Executes fast and efficient DELETE query. Does not check if entity exist in the database.
     * @param type The Entity class type
     * @param options Filter options for determining which entities to delete
     */
    static delete<T extends BaseEntity>(type: EntityTarget<T>, options: FindOptionsWhere<T>): Promise<DeleteResult>;
    /**
     * @desc Deletes entities of the provided type by a given criteria. Unlike save method executes a primitive operation without cascades, relations and other operations included. Executes fast and efficient DELETE query. Does not check if entity exist in the database.
     * @param type The Entity class type
     * @param options Filter options for determining which entities to delete
     */
    delete<T extends BaseEntity>(type: EntityTarget<T>, options: FindOptionsWhere<T>): Promise<DeleteResult>;
    /**
     * @description Encrypts data.
     * @param {String} data - Data to be encrypted
     */
    encrypt(data: string): Promise<{
        iv: string;
        data: string;
    }>;
    /**
     * @description Decrypts data.
     * @param {String} data - Data to be decrypted
     * @param {String} iv - Encryption iv
     */
    decrypt(data: string, iv: string): Promise<string>;
}
