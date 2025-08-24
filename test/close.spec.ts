import {setupTest} from './testUtils';
import {AuthTokenMethodEnum, Database, Platform, Provider} from "index";

describe('Close Provider', () => {
  const { getProvider } = setupTest(true);
  let provider: Provider;
  let databaseCloseSpy: jest.SpyInstance;
  let closeSpy: jest.SpyInstance;

  beforeEach(async () => {
    provider = getProvider();
    databaseCloseSpy = jest.spyOn(Database, 'close');
    closeSpy = jest.spyOn(provider, 'close');
  });

  it('Provider.close expected to work without error and close resources and connections', async () => {
    await provider.close();
    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(databaseCloseSpy).toHaveBeenCalledTimes(1);
    await expect(Database.find(Platform)).rejects.toThrow(
      new Error('DataSource is uninitialized'),
    );
  }, 10000);

  it('Provider.registerPlatform expected to throw error when Provider is closed', async () => {
    await provider.close();

    await expect(
      provider.registerPlatform({
        accessTokenEndpoint: 'http://localhost:2999/moodle/keys',
        authToken: {
          method: AuthTokenMethodEnum.JWK_SET,
          key: 'http://localhost:2999/moodle/keys',
        },
        authenticationEndpoint: 'http://localhost:2999/moodle/auth',
        clientId: `clientid3`,
        name: 'moodle',
        platformUrl: 'http://localhost:2999',
        active: true,
      }),
    ).rejects.toThrow(Error);
  });
});
