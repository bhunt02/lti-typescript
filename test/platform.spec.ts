import {Platform} from '../src/utils/platform';
import {AuthTokenMethodEnum} from '../src/utils/types';
import {Provider} from '../src/provider/provider';
import {setupTest} from './testUtils';
import {PlatformModel} from '../src/entities/platform.entity';
import {PrivateKeyModel, PublicKeyModel} from '../src/entities/key.entity';

describe('Platform', () => {
  const { getProvider } = setupTest();
  let provider: Provider;
  let platform: Platform;
  let model: PlatformModel;

  beforeAll(async () => {
    provider = getProvider();
  });

  beforeEach(async () => {
    platform = await provider.registerPlatform({
      platformUrl: 'http://localhost/moodle',
      name: 'Platform Name 1',
      clientId: 'ClientId1',
      authenticationEndpoint: 'http://localhost/moodle/AuthorizationUrl1',
      accessTokenEndpoint: 'http://localhost/moodle/AccessTokenUrl1',
      authToken: {
        method: AuthTokenMethodEnum.JWK_SET,
        key: 'http://localhost/moodle/keyset1',
      },
    });
    model = await PlatformModel.findOne({
      where: {
        platformUrl: platform.platformUrl,
        clientId: platform.clientId,
      },
    });
  });

  it('Platform.platformPublicKey expected to return publickey object', async () => {
    const key = await platform.platformPublicKey();
    expect(typeof key).toBe('object');
    expect(key).toHaveProperty('key');
    expect(key).toHaveProperty('kid', platform.kid);
  });

  it('Platform.platformPrivateKey expected to return privatekey object', async () => {
    const key = await platform.platformPrivateKey();
    expect(typeof key).toBe('object');
    expect(key).toHaveProperty('key');
    expect(key).toHaveProperty('kid', platform.kid);
  });

  it('Platform.setPlatformName expected to alter platform name', async () => {
    const value = 'Platform name';
    await platform.setName(value);
    expect(platform.name).toBe(value);
  });

  it('Platform.setActive expected to set whether platform is active or not', async () => {
    await platform.setActive(false);
    expect(platform.active).toBe(false);
    await platform.setActive(true);
    expect(platform.active).toBe(true);
  });

  it('Platform.setAuthConfig expected to alter platform auth configuration', async () => {
    const value = {
      method: AuthTokenMethodEnum.JWK_KEY,
      key: 'FKADPOFHKADPOKDPOGKHSPOFGKHFOGPKH',
    };
    await platform.setAuthConfig(value.method, value.key);
    expect(platform.authToken.method).toBe(value.method);
    expect(platform.authToken.key).toBe(value.key);
  });

  it('Platform.setAuthenticationEndpoint expected to alter platform authentication endpoint', async () => {
    const value = 'http://localhost/moodle/AuthorizationUrl';
    await platform.setAuthenticationEndpoint(value);
    expect(platform.authenticationEndpoint).toEqual(value);
  });

  it('Platform.setAccessTokenEndpoint expected to alter platform access token endpoint', async () => {
    const value = 'http://localhost/moodle/AccessTokenUrl';
    await platform.setAccessTokenEndpoint(value);
    expect(platform.accessTokenEndpoint).toEqual(value);
  }, 10000);

  it('Platform.setAuthorizationServer expected to alter platform authorizaion server', async () => {
    const value = 'http://localhost/moodle/AccessTokenUrlAud';
    await platform.setAuthorizationServer(value);
    expect(platform.authorizationServer).toEqual(value);
  });

  it('Platform.platformParams expected to return JSON object notation of platform properties', async () => {
    expect(await platform.platformParams()).toEqual({
      kid: model.kid,
      platformUrl: model.platformUrl,
      clientId: model.clientId,
      name: model.name,
      authenticationEndpoint: model.authenticationEndpoint,
      accessTokenEndpoint: model.accessTokenEndpoint,
      authToken: model.authToken(),
      publicKey: await platform.platformPublicKey(),
      active: model.active,
    });
  });

  it('Platform.delete expected to delete the platform and associated keys', async () => {
    await platform.delete();
    expect(await provider.getPlatformById(platform.kid)).toBeUndefined();
    expect(
      await PublicKeyModel.find({ where: { kid: platform.kid } }),
    ).toHaveLength(0);
    expect(
      await PrivateKeyModel.find({ where: { kid: platform.kid } }),
    ).toHaveLength(0);
  });
});
