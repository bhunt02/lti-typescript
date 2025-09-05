import {
  BaseEntity,
  DataSource,
  DataSourceOptions,
  DeepPartial,
  DeleteResult,
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  UpdateResult,
} from 'typeorm';
import * as crypto from 'crypto';
import {PlatformModel} from '../entities/platform.entity';
import {AccessTokenModel} from '../entities/access_token.entity';
import {ContextTokenModel} from '../entities/context_token.entity';
import {IdTokenModel} from '../entities/id_token.entity';
import {PrivateKeyModel, PublicKeyModel} from '../entities/key.entity';
import {NonceModel} from '../entities/nonce.entity';
import {StateModel} from '../entities/state.entity';
import {EncryptedEntity} from './types';
import {QueryDeepPartialEntity} from 'typeorm/query-builder/QueryPartialEntity';

export class Database {
  protected constructor() {
    return Database.instance;
  }

  private static instance: Database;

  private static encryptionKey: string;

  static _dataSource: DataSource;

  static get dataSource(): DataSource {
    if (!this._dataSource.isInitialized)
      throw new Error('DataSource is uninitialized');
    return this._dataSource;
  }

  /**
   * @desc Returns the active DataSource object which represents the connection to the database
   */
  get dataSource(): DataSource {
    return Database.dataSource;
  }

  private get encryptionKey(): string {
    return Database.encryptionKey;
  }

  /**
   * @desc Initializes connection to the database with TypeORM.
   * @param options Database connection options. Overwrite 'Entities' to use customized entities that are supported by the database of your choosing. Default entities support PostgreSQL database.
   * @param encryptionKey The encryption key used for encrypting/decrypting certain data
   * @param synchronize Whether to drop tables and recreate schema on startup (default: false)
   */
  static async initializeDatabase(
    options: DataSourceOptions,
    encryptionKey: string,
    synchronize = false,
  ) {
    if (this.instance) {
      return this.instance;
    }

    const entities = [
      AccessTokenModel,
      ContextTokenModel,
      IdTokenModel,
      PublicKeyModel,
      PrivateKeyModel,
      NonceModel,
      PlatformModel,
      StateModel,
    ];

    this.encryptionKey = encryptionKey;
    this.instance = new Database();
    this._dataSource = new DataSource({
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

  private async decryptRecord<
    T extends BaseEntity & { data: string; iv: string },
  >(record: T): Promise<T> {
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
  static async find<T extends BaseEntity>(
    type: EntityTarget<T>,
    options?: FindManyOptions<T>,
  ): Promise<T[]> {
    return await this.instance.find(type, options);
  }

  /**
   * @desc Finds entities of the defined type that match given find options.
   * @param type The Entity class type
   * @param options Find options
   */
  async find<T extends BaseEntity>(
    type: EntityTarget<T>,
    options?: FindManyOptions<T>,
  ): Promise<T[]> {
    const result = await this.dataSource.getRepository(type).find(options);

    return await Promise.all(
      result.map(async (record) => {
        if (record instanceof EncryptedEntity) {
          return await this.decryptRecord(record);
        } else {
          return record;
        }
      }),
    );
  }

  /**
   * @desc Finds first entity of the defined type by a given find options. If entity was not found in the database - returns null.
   * @param type The Entity class type
   * @param options Find options
   */
  static async findOne<T extends BaseEntity>(
    type: EntityTarget<T>,
    options: FindOneOptions<T>,
  ): Promise<T | undefined> {
    return await this.instance.findOne(type, options);
  }

  /**
   * @desc Finds first entity of the defined type by a given find options. If entity was not found in the database - returns null.
   * @param type The Entity class type
   * @param options Find options
   */
  async findOne<T extends BaseEntity>(
    type: EntityTarget<T>,
    options: FindOneOptions<T>,
  ): Promise<T | undefined> {
    const result = await this.dataSource.getRepository(type).findOne(options);
    if (!result) {
      return undefined;
    }

    if (result instanceof EncryptedEntity) {
      return await this.decryptRecord(result);
    }

    return result;
  }

  /**
   * @desc Saves a given entity of the provided type in the database. If entity does not exist in the database then inserts, otherwise updates.
   * @param type The Entity class type
   * @param params The parameters of the entity to save
   */
  static async save<T extends BaseEntity>(
    type: EntityTarget<T>,
    params: DeepPartial<T>,
  ): Promise<T> {
    return await this.instance.save(type, params);
  }

  /**
   * @desc Saves a given entity of the provided type in the database. If entity does not exist in the database then inserts, otherwise updates.
   * @param type The Entity class type
   * @param params The parameters of the entity to save
   */
  async save<T extends BaseEntity>(
    type: EntityTarget<T>,
    params: DeepPartial<T>,
  ): Promise<T> {
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
  static async update<T extends BaseEntity>(
    type: EntityTarget<T>,
    params: QueryDeepPartialEntity<T>,
    where: FindOptionsWhere<T>,
  ): Promise<UpdateResult> {
    return await this.instance.update(type, params, where);
  }

  /**
   * @desc Updates entity of given type partially. Entity can be found by a given conditions. Unlike save method executes a primitive operation without cascades, relations and other operations included. Executes fast and efficient UPDATE query. Does not check if entity exist in the database.
   * @param type The Entity class type
   * @param params The parameters of the entity to update
   * @param where Options to filter which entities are updated
   */
  async update<T extends BaseEntity>(
    type: EntityTarget<T>,
    params: QueryDeepPartialEntity<T>,
    where: FindOptionsWhere<T>,
  ): Promise<UpdateResult> {
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
  static async delete<T extends BaseEntity>(
    type: EntityTarget<T>,
    options: FindOptionsWhere<T>,
  ): Promise<DeleteResult> {
    return await this.instance.delete(type, options);
  }

  /**
   * @desc Deletes entities of the provided type by a given criteria. Unlike save method executes a primitive operation without cascades, relations and other operations included. Executes fast and efficient DELETE query. Does not check if entity exist in the database.
   * @param type The Entity class type
   * @param options Filter options for determining which entities to delete
   */
  async delete<T extends BaseEntity>(
    type: EntityTarget<T>,
    options: FindOptionsWhere<T>,
  ): Promise<DeleteResult> {
    return await this.dataSource.getRepository(type).delete(options);
  }

  /**
   * @description Encrypts data.
   * @param {String} data - Data to be encrypted
   */
  async encrypt(data: string) {
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
  async decrypt(data: string, iv: string) {
    const hash = crypto.createHash('sha256');
    hash.update(this.encryptionKey);
    const key = hash.digest().slice(0, 32);
    const newIv = Buffer.from(iv, 'hex');
    const encryptedText = Buffer.from(data, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(key),
      newIv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
