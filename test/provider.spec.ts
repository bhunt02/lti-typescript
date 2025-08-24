import {setupTest, TestEncryptionKey, TestProviderOptions, TestTypeOrmConfig,} from './testUtils';
import {AuthTokenMethodEnum, DynamicRegistrationOptions, Platform, Provider} from "index";

describe('Provider', () => {
  const { getProvider } = setupTest();
  let provider: Provider;

  beforeAll(() => {
    provider = getProvider();
  });

  it('Provider.deploy expected to throw error when Provider not setup', async () => {
    await expect(new Provider().deploy({ silent: true })).rejects.toThrow(
      Error,
    );
  });

  it('Provider.setup expected to not throw Error', async () => {
    await expect(
      (async () => {
        const prov = new Provider();
        await prov.setup(
          TestEncryptionKey,
          TestTypeOrmConfig,
          TestProviderOptions,
        );
      })(),
    ).resolves.not.toThrow(Error);
  });

  it.each([
    { url: undefined, name: 'name' },
    { url: 'url', name: undefined },
  ])(
    'Provider.setup expected to throw error if dynamic registration options missing properties when provided',
    async (dynRegOpts) => {
      await expect(
        (async () => {
          const prov = new Provider();
          await prov.setup(TestEncryptionKey, TestTypeOrmConfig, {
            ...TestProviderOptions,
            dynReg: dynRegOpts as DynamicRegistrationOptions,
          });
        })(),
      ).rejects.toThrow(new Error('MISSING_DYNREG_CONFIGURATION'));
    },
  );

  it.each([
    undefined,
    { key: undefined, cert: 'cert' },
    { key: 'key', cert: undefined },
  ])(
    'Provider.setup expected to throw error if SSL options missing properties when https true',
    async (sslOpts: any) => {
      await expect(
        (async () => {
          const prov = new Provider();
          await prov.setup(TestEncryptionKey, TestTypeOrmConfig, {
            ...TestProviderOptions,
            https: true,
            ssl: sslOpts,
          });
        })(),
      ).rejects.toThrow(new Error('MISSING_SSL_KEY_CERTIFICATE'));
    },
  );

  it('Provider.setup expected to throw Error when already setup', async () => {
    await expect(
      (async () => {
        await provider.setup(
          TestEncryptionKey,
          TestTypeOrmConfig,
          TestProviderOptions,
        );
      })(),
    ).rejects.toThrow(Error);
  });

  it('Provider.registerPlatform expected to throw error when Provider not deployed', async () => {
    await expect(
      provider.registerPlatform({
        platformUrl: 'http://localhost/moodle',
        name: 'Platform Name',
        clientId: 'ClientId1',
        authenticationEndpoint: 'http://localhost/moodle/AuthorizationUrl',
        accessTokenEndpoint: 'http://localhost/moodle/AccessTokenUrl',
        authToken: {
          method: 'INVALID_METHOD' as any,
          key: 'http://localhost/moodle/keyset',
        },
      }),
    ).rejects.toThrow(Error);
  });

  it('Provider.appRoute expected to return registered route', () => {
    expect(typeof provider.appRoute).toBe('string');
    expect(provider.appRoute).toEqual(TestProviderOptions.appUrl);
  });

  it('Provider.loginRoute expected to return registered route', () => {
    expect(typeof provider.loginRoute).toBe('string');
    expect(provider.loginRoute).toEqual(TestProviderOptions.loginUrl);
  });

  it('Provider.keySetRoute expected to return registered route', () => {
    expect(typeof provider.keySetRoute).toBe('string');
    expect(provider.keySetRoute).toEqual(TestProviderOptions.keySetUrl);
  });

  it('Provider.deploy expected to resolve true', async () => {
    await expect(
      provider.deploy({ silent: true, port: 3001 }),
    ).resolves.toEqual(true);
  });

  it('Provider.registerPlatform expected to throw error when missing argument', async () => {
    await expect(
      provider.registerPlatform({
        platformUrl: 'http://localhost/moodle',
        name: 'Platform Name',
        authenticationEndpoint: 'http://localhost/moodle/AuthorizationUrl',
        accessTokenEndpoint: 'http://localhost/moodle/AccessTokenUrl',
        authToken: {
          method: AuthTokenMethodEnum.JWK_SET,
          key: 'http://localhost/moodle/keyset',
        },
      } as any),
    ).rejects.toThrow(Error);
  });

  it('Provider.registerPlatform expected to throw error when invalid auth token method is passed', async () => {
    await expect(
      provider.registerPlatform({
        platformUrl: 'http://localhost/moodle',
        name: 'Platform Name',
        clientId: 'ClientId1',
        authenticationEndpoint: 'http://localhost/moodle/AuthorizationUrl',
        accessTokenEndpoint: 'http://localhost/moodle/AccessTokenUrl',
        authToken: {
          method: 'INVALID_METHOD' as any,
          key: 'http://localhost/moodle/keyset',
        },
      }),
    ).rejects.toThrow(Error);
  });

  it('Provider.registerPlatform expected to resolve Platform object', async () => {
    await expect(
      provider.registerPlatform({
        platformUrl: 'http://localhost/moodle',
        name: 'Platform Name',
        clientId: 'ClientId1',
        authenticationEndpoint: 'http://localhost/moodle/AuthorizationUrl1',
        accessTokenEndpoint: 'http://localhost/moodle/AccessTokenUrl1',
        authToken: {
          method: AuthTokenMethodEnum.JWK_SET,
          key: 'http://localhost/moodle/keyset1',
        },
      }),
    ).resolves.toBeInstanceOf(Platform);
  });

  it('Provider.registerPlatform with same Url and different Clientid expected to resolve Platform object', async () => {
    await expect(
      provider.registerPlatform({
        platformUrl: 'http://localhost/moodle',
        name: 'Platform Name 2',
        clientId: 'ClientId2',
        authenticationEndpoint: 'http://localhost/moodle/AuthorizationUrl1',
        accessTokenEndpoint: 'http://localhost/moodle/AccessTokenUrl1',
        authToken: {
          method: AuthTokenMethodEnum.JWK_SET,
          key: 'http://localhost/moodle/keyset1',
        },
      }),
    ).resolves.toBeInstanceOf(Platform);
  });

  it('Provider.registerPlatform expected to apply changes to registered Platform object', async () => {
    const name = 'New platform name';
    const props = {
      platformUrl: 'http://localhost/moodle',
      name: 'Platform Name 2',
      clientId: 'ClientId2',
      authenticationEndpoint: 'http://localhost/moodle/AuthorizationUrl1',
      accessTokenEndpoint: 'http://localhost/moodle/AccessTokenUrl1',
      authToken: {
        method: AuthTokenMethodEnum.JWK_SET,
        key: 'http://localhost/moodle/keyset1',
      },
    };
    let platform = await provider.registerPlatform(props);
    expect(platform.name).toBe('Platform Name 2');
    platform = await provider.registerPlatform({
      ...props,
      name,
    });
    expect(platform.name).toBe(name);
  });

  it('Provider.getPlatform expected to resolve Platform object', async () => {
    const platform0 = await provider.registerPlatform({
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
    const platform1 = await provider.registerPlatform({
      platformUrl: 'http://localhost/moodle',
      name: 'Platform Name 2',
      clientId: 'ClientId2',
      authenticationEndpoint: 'http://localhost/moodle/AuthorizationUrl1',
      accessTokenEndpoint: 'http://localhost/moodle/AccessTokenUrl1',
      authToken: {
        method: AuthTokenMethodEnum.JWK_SET,
        key: 'http://localhost/moodle/keyset1',
      },
    });
    expect(
      await provider.getPlatform('http://localhost/moodle', 'ClientId1'),
    ).toMatchObject(platform0);
    expect(
      await provider.getPlatform('http://localhost/moodle', 'ClientId2'),
    ).toMatchObject(platform1);
  }, 10000);

  it('Provider.getPlatformById expected to resolve Platform object', async () => {
    const platform = await provider.registerPlatform({
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

    await expect(provider.getPlatformById(platform.kid)).resolves.toMatchObject(
      platform,
    );
  });

  it('Provider.getAllPlatforms expected to resolve Array containing registered platforms', async () => {
    const platforms: Platform[] = [];
    for (let i = 0; i < 3; i++) {
      const platform = await provider.registerPlatform({
        platformUrl: 'http://localhost/moodle',
        name: `Platform Name ${i + 1}`,
        clientId: `ClientId${i + 1}`,
        authenticationEndpoint: 'http://localhost/moodle/AuthorizationUrl1',
        accessTokenEndpoint: 'http://localhost/moodle/AccessTokenUrl1',
        authToken: {
          method: AuthTokenMethodEnum.JWK_SET,
          key: 'http://localhost/moodle/keyset1',
        },
      });
      platforms.push(platform);
    }

    const platformsResult = await provider.getAllPlatforms();
    expect(platformsResult).not.toHaveLength(0);
    for (let i = 0; i < platformsResult.length; i++) {
      expect(platformsResult[i]).toMatchObject(platforms[i]);
    }
  }, 20000);

  it('Provider.deletePlatform expected to return true and delete the platform', async () => {
    const platform = await provider.registerPlatform({
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

    expect(
      await provider.getPlatform('http://localhost/moodle', 'ClientId1'),
    ).toMatchObject(platform);
    expect(
      await provider.deletePlatform('http://localhost/moodle', 'ClientId1'),
    ).toMatchObject(platform);
    expect(
      await provider.getPlatform('http://localhost/moodle', 'ClientId1'),
    ).toBeUndefined();
  });

  it('Provider.deletePlatformById expected to return true and delete the platform', async () => {
    const platform = await provider.registerPlatform({
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

    await expect(provider.getPlatformById(platform.kid)).resolves.toMatchObject(
      platform,
    );
    await expect(
      provider.deletePlatformById(platform.kid),
    ).resolves.toMatchObject(platform);
    await expect(
      provider.getPlatformById(platform.kid),
    ).resolves.toBeUndefined();
  });

  it('Provider.onConnect expected to throw error when receiving no callback', () => {
    expect(() => {
      return provider.onConnect(undefined!);
    }).toThrow(new Error('MISSING_CALLBACK'));
  });

  it('Provider.onConnect expected to not throw error when receiving callback', () => {
    expect(() => {
      return provider.onConnect(() => {});
    }).not.toThrow();
  });

  it('Provider.onDeepLinking expected to throw error when receiving no callback', () => {
    expect(() => {
      return provider.onDeepLinking(undefined!);
    }).toThrow(new Error('MISSING_CALLBACK'));
  });

  it('Provider.onDeepLinking expected to not throw error when receiving callback', () => {
    expect(() => {
      return provider.onDeepLinking(() => {});
    }).not.toThrow();
  });

  it('Provider.onSessionTimeout expected to throw error when receiving no callback', () => {
    expect(() => {
      return provider.onSessionTimeout(undefined!);
    }).toThrow(new Error('MISSING_CALLBACK'));
  });

  it('Provider.onSessionTimeout expected to not throw error when receiving callback', () => {
    expect(() => {
      return provider.onSessionTimeout(() => {});
    }).not.toThrow();
  });
  it('Provider.onInvalidToken expected to throw error when receiving no callback', () => {
    expect(() => {
      return provider.onInvalidToken(undefined!);
    }).toThrow(new Error('MISSING_CALLBACK'));
  });

  it('Provider.onInvalidToken expected to not throw error when receiving callback', () => {
    expect(() => {
      return provider.onInvalidToken(() => {});
    }).not.toThrow();
  });

  it('Provider.onUnregisteredPlatform expected to throw error when receiving no callback', () => {
    expect(() => {
      return provider.onUnregisteredPlatform(undefined!);
    }).toThrow(new Error('MISSING_CALLBACK'));
  });

  it('Provider.onUnregisteredPlatform expected to not throw error when receiving callback', () => {
    expect(() => {
      return provider.onConnect(() => {});
    }).not.toThrow();
  });

  it('Provider.onInactivePlatform expected to throw error when receiving no callback', () => {
    expect(() => {
      return provider.onInactivePlatform(undefined!);
    }).toThrow(new Error('MISSING_CALLBACK'));
  });

  it('Provider.onInactivePlatform expected to not throw error when receiving callback', () => {
    expect(() => {
      return provider.onInactivePlatform(() => {});
    }).not.toThrow();
  });
});
