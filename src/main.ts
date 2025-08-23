import 'reflect-metadata';
import {Provider as LtiProvider} from './provider/provider';
import {DataSourceOptions} from 'typeorm';
import {ProviderOptions} from './utils/types';

export default async function register(
  encryptionKey: string,
  databaseOptions: Omit<
    DataSourceOptions,
    | 'subscribers'
    | 'migrations'
    | 'migrationsTableName'
    | 'migrationsTransactionMode'
    | 'namingStrategy'
    | 'logging'
    | 'logger'
  >,
  options: ProviderOptions,
) {
  const provider = new LtiProvider();

  await provider.setup(
    encryptionKey,
    databaseOptions as DataSourceOptions,
    options,
  );

  return provider;
}
