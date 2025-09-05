import { BaseEntity, DataSource, DataSourceOptions, DeepPartial, DeleteResult, EntityTarget, FindManyOptions, FindOneOptions, FindOptionsWhere, UpdateResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
export declare class Database {
    protected constructor();
    private static instance;
    private static encryptionKey;
    static _dataSource: DataSource;
    static get dataSource(): DataSource;
    get dataSource(): DataSource;
    private get encryptionKey();
    static initializeDatabase(options: DataSourceOptions, encryptionKey: string, synchronize?: boolean): Promise<Database>;
    static close(): Promise<void>;
    close(): Promise<void>;
    private decryptRecord;
    static find<T extends BaseEntity>(type: EntityTarget<T>, options?: FindManyOptions<T>): Promise<T[]>;
    find<T extends BaseEntity>(type: EntityTarget<T>, options?: FindManyOptions<T>): Promise<T[]>;
    static findOne<T extends BaseEntity>(type: EntityTarget<T>, options: FindOneOptions<T>): Promise<T | undefined>;
    findOne<T extends BaseEntity>(type: EntityTarget<T>, options: FindOneOptions<T>): Promise<T | undefined>;
    static save<T extends BaseEntity>(type: EntityTarget<T>, params: DeepPartial<T>): Promise<T>;
    save<T extends BaseEntity>(type: EntityTarget<T>, params: DeepPartial<T>): Promise<T>;
    static update<T extends BaseEntity>(type: EntityTarget<T>, params: QueryDeepPartialEntity<T>, where: FindOptionsWhere<T>): Promise<UpdateResult>;
    update<T extends BaseEntity>(type: EntityTarget<T>, params: QueryDeepPartialEntity<T>, where: FindOptionsWhere<T>): Promise<UpdateResult>;
    static delete<T extends BaseEntity>(type: EntityTarget<T>, options: FindOptionsWhere<T>): Promise<DeleteResult>;
    delete<T extends BaseEntity>(type: EntityTarget<T>, options: FindOptionsWhere<T>): Promise<DeleteResult>;
    encrypt(data: string): Promise<{
        iv: string;
        data: string;
    }>;
    decrypt(data: string, iv: string): Promise<string>;
}
