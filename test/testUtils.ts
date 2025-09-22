import * as jwt from 'jsonwebtoken';
import * as supertest from 'supertest';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import * as express from 'express';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import * as http from 'node:http';
import * as crypto from 'crypto';
import * as Jwk from 'rasha';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import {
  AuthTokenMethodEnum,
  Callback,
  Database,
  IdToken,
  Platform,
  Provider,
  ProviderOptions,
  ValidatedToken,
} from 'index';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import TestAgent = require('supertest/lib/agent');

dotenv.config({
  path: path.join(path.join(__dirname, '..'), 'postgres.env'),
});
export const TestEncryptionKey = 'fake-encryption-key';

export const TestTypeOrmConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: 'lti_test',
  synchronize: true,
};

export const TestProviderOptions: ProviderOptions = {
  appUrl: '/',
  loginUrl: '/login',
  keySetUrl: '/keys',
  dynRegUrl: '/register',
  https: false,
  cors: false,
  cookies: {
    secure: false,
    sameSite: 'none',
  },
  devMode: false,
  debug: true,
  dynReg: {
    url: '/',
    name: 'LTIApplication',
    redirectUris: ['/login', '/keys', '/register'],
    autoActivate: false,
    useDeepLinking: false,
  },
};

export class PlatformTestApp {
  static platform: Platform;
  static app: express.Express;
  static server: http.Server;
  static activeRoutes: [
    string | RegExp,
    'ALL' | 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE',
    Callback,
  ][] = [];

  static init(platform: Platform) {
    this.close();
    this.platform = platform;

    this.app = express();
    this.addMiddleware();

    this.setRoute(
      this.platform.authenticationEndpoint,
      (_req, res) => res.sendStatus(200),
      'ALL',
      false,
    );
    this.setRoute(
      this.platform.accessTokenEndpoint,
      (_req, res) => res.sendStatus(200),
      'ALL',
      false,
    );
    if (this.platform.authorizationServer) {
      this.setRoute(
        this.platform.authorizationServer,
        (_req, res) => res.sendStatus(200),
        'ALL',
        false,
      );
    }
    this.refreshRoutes();
  }

  private static addMiddleware() {
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(
      bodyParser.json({
        type: [
          'application/json',
          'application/vnd.ims.lis.v2.lineitem+json',
          'application/vnd.ims.lis.v2.score+json',
        ],
      }),
    );
    this.app.use(cookieParser());
    if (TestProviderOptions.debug) {
      this.app.use((req, _, next) => {
        console.log(
          `Received ${req.method} request at ${req.url}:\nBODY: ${JSON.stringify(req.body)}\nPARAMS: ${JSON.stringify(req.params)}\n`,
        );
        return next();
      });
    }
  }

  static setRoute(
    route: string | RegExp,
    callback: Callback,
    method: 'ALL' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'ALL',
    refresh = true,
  ) {
    if (typeof route === 'string') {
      if (route.startsWith(this.platform.platformUrl)) {
        route = route.substring(this.platform.platformUrl.length);
      }
    }

    const removeIndices: number[] = [];
    for (const entry of this.activeRoutes
      .map((v, i) => [v, i])
      .filter(
        (v) =>
          v[0][0] == route &&
          (v[0][1] == method || v[0][1] == 'ALL' || method == 'ALL'),
      )) {
      removeIndices.push(entry[1] as number);
    }
    this.activeRoutes = this.activeRoutes.filter(
      (_, i) => !removeIndices.includes(i),
    );
    this.activeRoutes.push([route, method, callback]);

    if (refresh) {
      this.refreshRoutes();
    }
  }

  static refreshRoutes() {
    this.app = express();
    this.addMiddleware();

    for (const [route, method, callback] of this.activeRoutes) {
      switch (method) {
        case 'POST':
          this.app.post(route, callback);
          break;
        case 'GET':
          this.app.get(route, callback);
          break;
        case 'DELETE':
          this.app.delete(route, callback);
          break;
        case 'PUT':
          this.app.put(route, callback);
          break;
        case 'PATCH':
          this.app.patch(route, callback);
          break;
        default:
          this.app.all(route, callback);
          break;
      }
    }
    this.close();
    this.server = this.app.listen(2999);
  }

  static close() {
    if (this.server && this.server.listening) {
      this.server.close();
    }
  }
}

export function setupTest(
  deploy: boolean = false,
  deployOptions?: { port?: number; silent?: boolean; serverless?: boolean },
): {
  getProvider: () => Provider;
  supertest: (cookies?: any) => TestAgent<supertest.Test>;
} {
  const provider: Provider = new Provider();

  beforeAll(async () => {
    await provider.setup(
      TestEncryptionKey,
      TestTypeOrmConfig,
      TestProviderOptions,
    );
    if (deploy) {
      await provider.deploy(deployOptions);
    }
  }, 10000);

  afterAll(async () => {
    await provider.close();
  }, 10000);

  beforeEach(async () => {
    if (!Database._dataSource.isInitialized) {
      await Database._dataSource.initialize();
    }
    await Database._dataSource.synchronize(true);
  });

  return {
    // Supertest agent
    supertest: (options?: any): TestAgent<supertest.Test> => {
      if (!provider) {
        throw new Error(
          'Provider has not been initialized yet. Ensure `beforeAll` has run.',
        );
      }
      const agent = supertest.agent(provider.getServer());
      if (options) {
        agent.set({
          cookie: options,
        });
      }
      return agent;
    },

    // Lazy getter for the test module since it is initialized in beforeAll block
    getProvider: () => {
      if (!provider) {
        throw new Error(
          'Provider has not been initialized yet. Ensure `beforeAll` has run.',
        );
      }
      return provider;
    },
  };
}

export function setupAuthenticatedTest(
  init?: {
    provider: Provider;
    getProvider: () => Provider;
    supertest: (cookies?: any) => TestAgent<supertest.Test>;
    platform?: Platform;
  },
  setupOptions?: {
    deploy?: boolean;
    deployOptions?: { port?: number; silent?: boolean; serverless?: boolean };
  },
  deepLink = false,
  deepLinkingMessageType = false,
): {
  getProvider: () => Provider;
  getPlatform: () => Platform;
  supertest: (u?: any) => TestAgent<supertest.Test>;
  getKeys: () => crypto.KeyPairSyncResult<string, string>;
  signToken: (token: string, kid?: string) => string;
  getToken: () => any;
  loginFlow: (
    tokenModifications?: Partial<
      Omit<ValidatedToken, 'clientId' | 'platformId'>
    >,
    redirect?: string,
    overwriteJwt?: any,
    kid?: string,
    failAtAuth?: boolean,
  ) => Promise<supertest.Response | [IdToken, any]>;
  getTokenAndState: () => Promise<[{ id_token: any; state: any }, any]>;
} {
  let provider = init?.provider;
  const setupResult =
    init != undefined
      ? { getProvider: init.getProvider, supertest: init.supertest }
      : setupTest(setupOptions.deploy, setupOptions.deployOptions);
  const getProvider = setupResult.getProvider;
  const supertest = setupResult.supertest;
  let platform: Platform = init?.platform;

  let tokenValid: Omit<ValidatedToken, 'clientId' | 'platformId'>;
  let keys: crypto.KeyPairSyncResult<string, string>;

  const signToken = (token: string, kid?: string) => {
    if (!kid)
      return jwt.sign(token, keys.privateKey, {
        algorithm: 'RS256',
        allowInsecureKeySizes: true,
      });
    return jwt.sign(token, keys.privateKey, {
      algorithm: 'RS256',
      keyid: kid,
      allowInsecureKeySizes: true,
    });
  };

  beforeAll(() => {
    keys = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
    });
  });

  beforeEach(async () => {
    provider = getProvider();

    platform = await provider.registerPlatform({
      accessTokenEndpoint: 'http://localhost:2999/moodle/keys',
      authToken: {
        method: AuthTokenMethodEnum.JWK_SET,
        key: 'http://localhost:2999/moodle/keys',
      },
      authenticationEndpoint: 'http://localhost:2999/moodle/auth',
      clientId: 'clientid',
      name: 'moodle',
      platformUrl: 'http://localhost:2999',
      active: true,
    });

    PlatformTestApp.init(platform);

    const jwks = [
      {
        ...(await Jwk.import({ pem: keys.publicKey })),
        kid: platform.kid,
        alg: 'RS256',
        use: 'sig',
      },
    ];

    PlatformTestApp.setRoute(
      platform.accessTokenEndpoint,
      (_req, res) => {
        console.log('received request for JWKS');
        res.status(200).send({
          keys: jwks,
        });
      },
      'GET',
    );

    tokenValid = {
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      iss: platform.platformUrl,
      aud: platform.clientId,
      'https://purl.imsglobal.org/spec/lti/claim/deployment_id': '2',
      'https://purl.imsglobal.org/spec/lti/claim/target_link_uri':
        provider.appRoute,
      sub: '2',
      'https://purl.imsglobal.org/spec/lti/claim/lis': {
        person_sourcedid: '',
        course_section_sourcedid: '',
      },
      'https://purl.imsglobal.org/spec/lti/claim/roles': [
        'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator',
        'http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor',
        'http://purl.imsglobal.org/vocab/lis/v2/system/person#Administrator',
      ],
      'https://purl.imsglobal.org/spec/lti/claim/context': {
        id: '3',
        label: 'Curso Teste',
        title: 'Curso Teste',
        type: [],
      },
      'https://purl.imsglobal.org/spec/lti/claim/resource_link': {
        title: 'teste local',
        id: '5',
      },
      given_name: 'Firstname',
      family_name: 'Lastname',
      name: 'Firstname Lastname',
      'https://purl.imsglobal.org/spec/lti/claim/ext': {
        user_username: 'fake_user@example.com',
        lms: 'moodle-2',
      },
      email: 'fake_user@example.com',
      'https://purl.imsglobal.org/spec/lti/claim/launch_presentation': {
        locale: 'pt_br',
        document_target: 'iframe',
      },
      'https://purl.imsglobal.org/spec/lti/claim/tool_platform': {
        family_code: 'moodle',
        version: '2019052000.02',
        guid: `${platform.platformUrl}`,
        name: 'fakeLTI',
        description: 'fakeLTI',
      },
      'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
      'https://purl.imsglobal.org/spec/lti/claim/message_type':
        'LtiResourceLinkRequest',
      'https://purl.imsglobal.org/spec/lti/claim/custom': {},
      'https://purl.imsglobal.org/spec/lti-ags/claim/endpoint': {
        scope: [],
        lineitems: `${platform.platformUrl}/lineitems?`,
        lineitem: `${platform.platformUrl}/lineitem?`,
      },
      'https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice': {
        context_memberships_url: `${platform.platformUrl}/memberships`,
        service_versions: [],
      },
    };
    if (deepLink) {
      tokenValid = {
        ...tokenValid,
        ['https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings']:
          {
            deep_link_return_url: 'http://localhost:3000/',
            accept_types: ['ltiResourceLink'],
            accept_presentation_document_targets: ['window', 'iframe', 'embed'],
            accept_multiple: true,
            auto_create: false,
            title: 'deepLink',
            text: 'deepLinkText',
            data: 'deepLinkData',
          },
      };
    }
    if (deepLinkingMessageType) {
      tokenValid = {
        ...tokenValid,
        ['https://purl.imsglobal.org/spec/lti/claim/message_type']:
          'LtiDeepLinkingRequest',
      };
    }
  }, 30000);

  afterAll(() => {
    PlatformTestApp.server.close();
  });

  const loginFlow = async (
    tokenModifications?: Partial<
      Omit<ValidatedToken, 'clientId' | 'platformId'>
    >,
    redirect?: string,
    overwriteJwt?: any,
    kid?: string,
    failAtAuth?: boolean,
  ): Promise<supertest.Response | [IdToken, any]> => {
    let idToken: IdToken;
    provider.onConnect((token, _, res) => {
      idToken = token;
      if (redirect !== undefined) {
        provider.redirect(res, redirect, { newResource: true });
      }
      res.status(200).send(token);
    });

    const redirectResponse = await supertest()
      .post(provider.loginRoute)
      .send({
        iss: platform.platformUrl,
        login_hint: '2',
        target_link_uri: 'http://localhost:3000' + provider.appRoute,
        client_id: 'clientid',
      })
      .expect(302);

    let redirectUrl = redirectResponse.header['location'];
    let qryString = decodeURIComponent(
      redirectUrl.substring(redirectUrl.indexOf('?') + 1),
    );
    let searchParams = new URLSearchParams(qryString);

    let payload: string;
    if (!overwriteJwt) {
      const token = {
        ...JSON.parse(JSON.stringify(tokenValid)),
        ...tokenModifications,
        aud:
          tokenModifications?.aud !== undefined
            ? Array.isArray(tokenModifications.aud)
              ? [...tokenModifications.aud].concat(
                  !failAtAuth ? [platform.clientId] : [],
                )
              : failAtAuth
                ? tokenModifications.aud
                : tokenValid.aud
            : tokenValid.aud,
        nonce: searchParams.get('nonce'),
      };

      if (tokenModifications) {
        Object.keys(tokenModifications).forEach((k) => {
          if (tokenModifications[k] === null) {
            delete token[k];
          }
        });
      }
      payload = signToken(
        token,
        kid === null ? undefined : (kid ?? platform.kid),
      );
    } else {
      payload = signToken(
        overwriteJwt,
        kid === null ? undefined : (kid ?? platform.kid),
      );
    }

    const ltikResponse = await supertest()
      .post(
        searchParams
          .get('redirect_uri')
          .substring('http://localhost:3000'.length),
      )
      .send({
        id_token: payload,
        state: searchParams.get('state'),
      })
      .set('Cookie', redirectResponse.header['set-cookie'])
      .expect(failAtAuth ? 401 : 302);

    if (failAtAuth) {
      return ltikResponse;
    }

    redirectUrl = ltikResponse.header['location'];
    qryString = decodeURIComponent(
      redirectUrl.substring(redirectUrl.indexOf('?') + 1),
    );
    searchParams = new URLSearchParams(qryString);

    const response = await supertest()
      .post(redirectUrl)
      .send({
        id_token: payload,
        state: searchParams.get('state'),
      })
      .set('Cookie', ltikResponse.header['set-cookie'])
      .expect(200);

    provider
      .getPlatform(response.body.iss, response.body.clientId)
      .then((platform) => {
        expect(platform).not.toBeUndefined();
        expect(response.body.platformId).toEqual(platform.kid);
      });

    return [idToken, response.header['set-cookie']];
  };

  const getTokenAndState = async (): Promise<
    [{ id_token: any; state: any }, any]
  > => {
    const redirectResponse = await supertest()
      .post(provider.loginRoute)
      .send({
        iss: platform.platformUrl,
        login_hint: '2',
        target_link_uri: 'http://localhost:3000' + provider.appRoute,
        client_id: 'clientid',
      })
      .expect(302);

    const redirectUrl = redirectResponse.header['location'];
    const qryString = decodeURIComponent(
      redirectUrl.substring(redirectUrl.indexOf('?') + 1),
    );
    const searchParams = new URLSearchParams(qryString);

    const token = {
      ...JSON.parse(JSON.stringify(tokenValid)),
      nonce: searchParams.get('nonce'),
    };
    const payload = signToken(token, platform.kid);

    return [
      {
        id_token: payload,
        state: searchParams.get('state'),
      },
      redirectResponse.header['set-cookie'],
    ];
  };

  return {
    getProvider,
    getPlatform: () => {
      if (!platform) {
        throw new Error(
          'Platform has not been initialized yet. Ensure `beforeAll` has run.',
        );
      }
      return platform;
    },
    supertest,
    signToken,
    getKeys: () => {
      if (!keys) {
        throw new Error(
          'Keys has not been initialized yet. Ensure `beforeAll` has run.',
        );
      }
      return keys;
    },
    getToken: () => {
      if (!tokenValid) {
        throw new Error(
          'Token has not been initialized yet. Ensure `beforeAll` has run.',
        );
      }
      return tokenValid;
    },
    loginFlow,
    getTokenAndState,
  };
}
