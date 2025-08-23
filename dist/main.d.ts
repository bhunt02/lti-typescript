import 'reflect-metadata';
import {Provider as LtiProvider} from './provider/provider';
import {DataSourceOptions} from 'typeorm';
import {ProviderOptions} from './utils/types';

export default function register(encryptionKey: string, databaseOptions: Omit<DataSourceOptions, 'subscribers' | 'migrations' | 'migrationsTableName' | 'migrationsTransactionMode' | 'namingStrategy' | 'logging' | 'logger'>, options: ProviderOptions): Promise<LtiProvider>;
