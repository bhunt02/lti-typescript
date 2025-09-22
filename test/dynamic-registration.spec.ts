import { PlatformTestApp, setupTest } from './testUtils';
import { AuthConfigType, AuthTokenMethodEnum, Platform, PlatformModel, Provider } from 'index';

jest.setTimeout(20000);
describe('DynamicRegistration Service', () => {
  const { supertest, getProvider } = setupTest(true);
  let provider: Provider;

  const mockPlatform: Platform = new Platform({
    accessTokenEndpoint: 'http://localhost:2999/moodle/keys',
    authTokenMethod: AuthTokenMethodEnum.JWK_SET,
    authTokenKey: 'http://localhost:2999/moodle/keys',
    authenticationEndpoint: 'http://localhost:2999/moodle/auth',
    clientId: '123456',
    name: 'moodle',
    platformUrl: 'http://localhost:2999',
    active: true,
    kid: '123456',
    authToken: function (): AuthConfigType {
      return {
        method: this.authTokenMethod,
        key: this.authTokenKey,
      };
    },
  } as unknown as PlatformModel);

  const registrationResponse = {
    client_id: '123456',
  };

  const dynamicRegistrationRequest = {
    openid_configuration: 'http://localhost:2999/openid_configuration',
    registration_token:
      'gYA8ZDOdQHrsBMiklOIQcyeaLmdUug6a5V6VN28AOp3YFhmUK.oWoiuasjvdvgqweuytbnvcuiyeqyaFK8zWs',
  };

  const configurationInformation = {
    issuer: 'http://localhost:2999',
    authorization_endpoint: 'http://localhost:2999/authorize',
    token_endpoint: 'http://localhost:2999/token',
    'token_ endpoint_auth_methods_supported': ['private_key_jwt'],
    token_endpoint_auth_signing_alg_values_supported: ['RS256'],
    jwks_uri: 'http://localhost:2999/keyset',
    registration_endpoint: 'http://localhost:2999/register',
    scopes_supported: [
      'openid',
      'https://purl.imsglobal.org/spec/lti-gs/scope/contextgroup.readonly',
      'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
      'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly',
      'https://purl.imsglobal.org/spec/lti-ags/scope/score',
      'https://purl.imsglobal.org/spec/lti-reg/scope/registration',
      'https://purl.imsglobal.org/spec/lti-reg/scope/registration.readonly',
    ],
    response_types_supported: ['id_token'],
    subject_types_supported: ['public', 'pairwise'],
    id_token_signing_alg_values_supported: ['RS256', 'ES256', 'HS256'],
    claims_supported: [
      'sub',
      'iss',
      'name',
      'given_name',
      'family_name',
      'nickname',
      'picture',
      'email',
      'locale',
    ],
    'https://purl.imsglobal.org/spec/lti-platform-configuration': {
      product_family_code: 'ExampleLMS',
      messages_supported: [
        { type: 'LtiResourceLink' },
        { type: 'LtiDeepLinkingRequest', placements: 'ContentArea' },
      ],
      variables: [
        'CourseSection.timeFrame.end',
        'CourseSection.timeFrame.begin',
        'Context.id.history',
        'ResourceLink.id.history',
      ],
    },
  };

  beforeEach(async () => {
    provider = getProvider();
    PlatformTestApp.init(mockPlatform);
    PlatformTestApp.setRoute(
      '/openid_configuration',
      (req, res) => {
        return res.status(200).send(configurationInformation);
      },
      'ALL',
    );
    PlatformTestApp.setRoute(
      '/register',
      (req, res) => {
        return res.status(200).send(registrationResponse);
      },
      'POST',
    );
    PlatformTestApp.setRoute(
      '/token',
      (req, res) => {
        return res.status(200).set('Content-Type', 'application/json').json({
          access_token: 'dkj4985kjaIAJDJ89kl8rkn5',
          token_type: 'bearer',
          expires_in: 3600,
          scope: req.body.scopes,
        });
      },
      'POST',
    );
  });

  afterAll(() => {
    PlatformTestApp.close();
  });

  it('Dynamic Registration endpoint expected to return valid closing message and register Platform', async () => {
    await supertest()
      .get(provider.dynRegRoute)
      .query(dynamicRegistrationRequest)
      .expect(200)
      .then(async (response) => {
        expect(response.text).toEqual(
          '<script>(window.opener || window.parent).postMessage({subject:"org.imsglobal.lti.close"}, "*");</script>',
        );
        const platform = await provider.getPlatform(
          'http://localhost:2999',
          '123456',
        );
        expect(platform).toBeInstanceOf(Platform);
        expect(platform.active).toBeFalsy();
        expect(platform.platformUrl).toEqual(configurationInformation.issuer);
        const authConfig = platform.authToken;
        expect(authConfig.key).toEqual(configurationInformation.jwks_uri);
        expect(platform.authenticationEndpoint).toEqual(
          configurationInformation.authorization_endpoint,
        );
        expect(platform.accessTokenEndpoint).toEqual(
          configurationInformation.token_endpoint,
        );
      });
  });

  it('Login route with inactive platform is expected to return 401 error', async () => {
    await supertest()
      .post(provider.loginRoute)
      .send({
        iss: mockPlatform.platformUrl,
        login_hint: '2',
        target_link_uri: provider.appRoute,
      })
      .expect(400)
      .then((response) => {
        expect(response.body.message).toEqual('UNREGISTERED_PLATFORM');
      });
  });

  it('Dynamically registered Platform expected to be activated by Platform.platformActive(true)', async () => {
    await supertest()
      .get(provider.dynRegRoute)
      .query(dynamicRegistrationRequest)
      .expect(200);
    const platform = await provider.getPlatform(
      mockPlatform.platformUrl,
      mockPlatform.clientId,
    );
    expect(platform).toBeInstanceOf(Platform);
    expect(platform.active).toEqual(false);
    await platform.setActive(true);
    expect(platform.active).toEqual(true);
  });

  it('Register should fail if configuration registration endpoint is unreachable or errors', async () => {
    PlatformTestApp.setRoute(
      '/openid_configuration',
      (_, res) => {
        return res.sendStatus(404);
      },
      'ALL',
    );

    await supertest()
      .get(provider.dynRegRoute)
      .query(dynamicRegistrationRequest)
      .expect(500)
      .then((response) => {
        expect(response.body.message).toEqual('404: Not Found');
      });
  }, 10000);

  it('Register should fail if configuration registration endpoint is unreachable or errors', async () => {
    PlatformTestApp.setRoute(
      '/register',
      (_, res) => {
        return res.sendStatus(404);
      },
      'POST',
    );

    await supertest()
      .get(provider.dynRegRoute)
      .query(dynamicRegistrationRequest)
      .expect(500)
      .then((response) => {
        expect(response.body.message).toEqual('404: Not Found');
      });
  }, 10000);

  it('Should fail if platform is already registered', async () => {
    await supertest()
      .get(provider.dynRegRoute)
      .query(dynamicRegistrationRequest)
      .expect(200);

    await supertest()
      .get(provider.dynRegRoute)
      .query(dynamicRegistrationRequest)
      .expect(403)
      .then((response) => {
        expect(response.body.message).toEqual('Platform already registered.');
      });
  });

  it('Should fail if Dynamic Registration is disabled', async () => {
    const prevValue = provider['_DynamicRegistration'];
    provider['_DynamicRegistration'] = undefined;
    await supertest()
      .get(provider.dynRegRoute)
      .query(dynamicRegistrationRequest)
      .expect(403)
      .then((response) => {
        expect(response.body.message).toEqual(
          'Dynamic registration is disabled.',
        );
      });
    provider['_DynamicRegistration'] = prevValue;
  });

  // Must be last as it overwrites callback
  it('Dynamic Registration endpoint should merge custom registration parameters with defaults', async () => {
    const custom = {
      initiate_login_uri: '/newlogin',
      redirect_uris: ['/redirect1', '/redirect2'],
      client_name: 'newltiname',
      jwks_uri: '/newkeys',
      logo_uri: '/newlogo.png',
    };

    provider.onDynamicRegistration(async (req, res) => {
      const message = await provider.DynamicRegistration.register(
        req.query.openid_configuration as string,
        req.query.registration_token as string,
        custom,
      );
      res.setHeader('Content-type', 'text/html');
      res.send(message);
    });

    PlatformTestApp.setRoute(
      '/register',
      (req, res) => {
        Object.keys(custom).forEach((key) => {
          expect(req.body[key]).toEqual(custom[key]);
        });
        return res.status(200).send(registrationResponse);
      },
      'POST',
    );

    await supertest()
      .get(provider.dynRegRoute)
      .query(dynamicRegistrationRequest)
      .expect(200);
  });

  describe('DynamicRegistration.getRegistration', () => {
    it('should fail if platform is not dynamically registered or missing registration endpoint', async () => {
      let platform = await provider.registerPlatform({
        accessTokenEndpoint: 'http://localhost:2999/moodle/token',
        authToken: {
          method: AuthTokenMethodEnum.JWK_SET,
          key: 'http://localhost:2999/moodle/token',
        },
        authenticationEndpoint: 'http://localhost:2999/moodle/auth',
        clientId: 'clientid',
        name: 'moodle',
        platformUrl: 'http://localhost:2999',
        active: true,
      });

      await expect(
        provider.DynamicRegistration.getRegistration(platform),
      ).rejects.toThrow('PLATFORM_REGISTRATION_STATIC');

      platform = await provider.registerPlatform({
        clientId: 'clientid',
        platformUrl: 'http://localhost:2999',
        active: true,
        dynamicallyRegistered: true,
      } as any);

      await expect(
        provider.DynamicRegistration.getRegistration(platform),
      ).rejects.toThrow('MISSING_REGISTRATION_ENDPOINT');
    });

    it('should fail if scope is unsupported', async () => {
      const platform = await provider.registerPlatform({
        accessTokenEndpoint: 'http://localhost:2999/token',
        authToken: {
          method: AuthTokenMethodEnum.JWK_SET,
          key: 'http://localhost:2999/token',
        },
        authenticationEndpoint: 'http://localhost:2999/moodle/auth',
        clientId: 'clientid',
        name: 'moodle',
        platformUrl: 'http://localhost:2999',
        active: true,
        dynamicallyRegistered: true,
        registrationEndpoint: 'http:/localhost:2999/moodle/register',
        scopesSupported: [],
      });
      await expect(
        provider.DynamicRegistration.getRegistration(platform),
      ).rejects.toThrow('SCOPE_UNSUPPORTED');
    });

    it('should retrieve registration for platform that was dynamically registered', async () => {
      provider.onDynamicRegistration(async (req, res) => {
        const message = await provider.DynamicRegistration.register(
          req.query.openid_configuration as string,
          req.query.registration_token as string,
        );
        res.setHeader('Content-type', 'text/html');
        res.send(message);
      });

      PlatformTestApp.setRoute(
        '/register',
        (req, res) => {
          return res.status(200).send(registrationResponse);
        },
        'POST',
      );

      PlatformTestApp.setRoute(
        '/register',
        (req, res) => {
          expect(req.headers['authorization']).toBeDefined();
          return res.status(200).send(registrationResponse);
        },
        'GET',
      );

      await supertest()
        .get(provider.dynRegRoute)
        .query(dynamicRegistrationRequest)
        .expect(200);

      const platform = await provider.getPlatform(
        configurationInformation.issuer,
        registrationResponse.client_id,
      );
      const registration =
        await provider.DynamicRegistration.getRegistration(platform);
      expect(registration).toEqual(registrationResponse);
    });
  });

  describe('DynamicRegistration.updateRegistration', () => {
    it('should fail if platform is not dynamically registered or missing registration endpoint', async () => {
      let platform = await provider.registerPlatform({
        accessTokenEndpoint: 'http://localhost:2999/token',
        authToken: {
          method: AuthTokenMethodEnum.JWK_SET,
          key: 'http://localhost:2999/token',
        },
        authenticationEndpoint: 'http://localhost:2999/moodle/auth',
        clientId: 'clientid',
        name: 'moodle',
        platformUrl: 'http://localhost:2999',
        active: true,
      });

      await expect(
        provider.DynamicRegistration.updateRegistration(platform),
      ).rejects.toThrow('PLATFORM_REGISTRATION_STATIC');

      platform = await provider.registerPlatform({
        clientId: 'clientid',
        platformUrl: 'http://localhost:2999',
        dynamicallyRegistered: true,
      } as any);

      await expect(
        provider.DynamicRegistration.updateRegistration(platform),
      ).rejects.toThrow('MISSING_REGISTRATION_ENDPOINT');
    });

    it('should fail if scope is unsupported', async () => {
      const platform = await provider.registerPlatform({
        accessTokenEndpoint: 'http://localhost:2999/token',
        authToken: {
          method: AuthTokenMethodEnum.JWK_SET,
          key: 'http://localhost:2999/token',
        },
        authenticationEndpoint: 'http://localhost:2999/moodle/auth',
        clientId: 'clientid',
        name: 'moodle',
        platformUrl: 'http://localhost:2999',
        active: true,
        dynamicallyRegistered: true,
        scopesSupported: [],
      });
      await expect(
        provider.DynamicRegistration.updateRegistration(platform),
      ).rejects.toThrow('SCOPE_UNSUPPORTED');
    });

    it('should call PUT on registration route to update registration', async () => {
      provider.onDynamicRegistration(async (req, res) => {
        const message = await provider.DynamicRegistration.register(
          req.query.openid_configuration as string,
          req.query.registration_token as string,
        );
        res.setHeader('Content-type', 'text/html');
        res.send(message);
      });

      PlatformTestApp.setRoute(
        '/register',
        (req, res) => {
          return res.status(200).send(registrationResponse);
        },
        'POST',
      );

      PlatformTestApp.setRoute(
        '/register',
        (req, res) => {
          expect(req.headers['authorization']).toBeDefined();
          return res.status(200).send(registrationResponse);
        },
        'PUT',
      );

      PlatformTestApp.setRoute(
        '/register',
        (req, res) => {
          expect(req.headers['authorization']).toBeDefined();
          return res.status(200).send(registrationResponse);
        },
        'GET',
      );

      await supertest()
        .get(provider.dynRegRoute)
        .query(dynamicRegistrationRequest)
        .expect(200);

      const platform = await provider.getPlatform(
        configurationInformation.issuer,
        registrationResponse.client_id,
      );
      const registration =
        await provider.DynamicRegistration.updateRegistration(platform);
      expect(registration).toEqual(registrationResponse);
    });
  });
});
