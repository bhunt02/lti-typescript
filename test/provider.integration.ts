import {PlatformTestApp, setupAuthenticatedTest,} from './testUtils';
import {Provider} from '../src/provider/provider';
import {Platform} from '../src/utils/platform';
import {KeyObject} from '../src/utils/types';
import supertest from 'supertest';
import {Keyset} from '../src/utils/keyset';
import {StateModel} from '../src/entities/state.entity';

describe('Provider Integration Tests', () => {
  const { supertest, getProvider, getPlatform, loginFlow } =
    setupAuthenticatedTest(undefined, { deploy: true });

  let provider: Provider;
  let platform: Platform;

  beforeAll(async () => {
    provider = getProvider();
  });

  beforeEach(async () => {
    platform = getPlatform();
  });

  describe('Provider.loginRoute', () => {
    beforeEach(async () => {
      platform = getPlatform();

      PlatformTestApp.init(platform);

      PlatformTestApp.setRoute(
        platform.authenticationEndpoint,
        (req, res) => {
          res.redirect(200, provider.appRoute);
        },
        'ALL',
      );
    });

    describe('POST', () => {
      it('Login route with missing parameters is expected to return 400 error', async () => {
        await supertest()
          .post(provider.loginRoute)
          .send({ iss: 'http://localhost/moodle' })
          .expect(400)
          .then((response) => {
            expect(response.body).toHaveProperty(
              'message',
              'MISSING_LOGIN_PARAMETERS',
            );
          });
      });

      it('Login route with unregistered platform is expected to return 400 error', async () => {
        return supertest()
          .post(provider.loginRoute)
          .send({
            iss: 'https://unregistered-platform.com',
            login_hint: '2',
            target_link_uri: 'http://localhost:3000/',
          })
          .expect(400)
          .then((response) => {
            expect(response.body).toHaveProperty(
              'message',
              'UNREGISTERED_PLATFORM',
            );
          });
      });

      it('Login route request with registered platform is expected to redirect to authenticationEndpoint', async () => {
        await supertest()
          .post(provider.loginRoute)
          .send({
            iss: platform.platformUrl,
            login_hint: '2',
            target_link_uri: 'http://localhost:3000/',
            client_id: 'clientid',
          })
          .redirects(1)
          .expect(200);
      });

      it('Login route request with registered platform with target_link_uri having query params is expected to redirect to authenticationEndpoint with query params saved into StateModel', async () => {
        await supertest()
          .post(provider.loginRoute)
          .send({
            iss: platform.platformUrl,
            login_hint: '2',
            target_link_uri: 'http://localhost:3000/?param=param',
            client_id: 'clientid',
          })
          .redirects(1)
          .expect(200)
          .then(async (response) => {
            const redirect = new global.URL(response.redirects[0]);
            const instance = await StateModel.findOne({
              where: {
                state: redirect.searchParams.get('state'),
              },
            });
            expect(instance.query).toEqual({
              param: 'param',
            });
          });
      });

      it('Login route request with inactive platform is expected to forward to inactivePlatformCallback', async () => {
        await platform.setActive(false);

        await supertest()
          .get(provider.loginRoute)
          .send({
            iss: platform.platformUrl,
            login_hint: '2',
            target_link_uri: 'http://localhost:3000/',
            client_id: 'clientid',
          })
          .expect(401)
          .then((response) => {
            expect(response.body.message).toEqual('PLATFORM_NOT_ACTIVATED');
          });
      });
    });

    describe('GET', () => {
      it('Login route request with registered platform is expected to redirect to authenticationEndpoint', async () => {
        await supertest()
          .get(
            provider.loginRoute +
              '?' +
              new URLSearchParams({
                iss: platform.platformUrl,
                login_hint: '2',
                target_link_uri: 'http://localhost:3000/',
                client_id: 'clientid',
              }).toString(),
          )
          .redirects(1)
          .expect(200)
          .then((response) => {
            console.log(response);
          });
      });
    });
  });

  describe('Provider.keySetRoute', () => {
    describe('GET', () => {
      it('Keyset route is expected to return valid keyset', async () => {
        await supertest()
          .get(provider.keySetRoute)
          .expect(200)
          .then((response) => {
            const keyset = JSON.parse(response.text);
            expect(
              keyset.keys.find((k: KeyObject) => k.kid === platform.kid),
            ).not.toBeUndefined();
          });
      });

      it('Should fail if building keyset throws error', async () => {
        const spy = jest.spyOn(Keyset, 'build');
        spy.mockRejectedValue(new Error('Failed to build keyset'));

        await supertest()
          .get(provider.keySetRoute)
          .expect(500)
          .then((response) => {
            expect(spy).toHaveBeenCalledTimes(1);
            expect(response.body.message).toEqual('Failed to build keyset');
          });
      });
    });
  });

  const multiRouteFx = (
    route: string,
    method: 'GET' | 'POST' | 'DELETE' | 'PATCH',
  ): supertest.Test => {
    switch (method) {
      case 'POST':
        return supertest().post(route);
      case 'GET':
        return supertest().get(route);
      case 'DELETE':
        return supertest().delete(route);
      case 'PATCH':
        return supertest().patch(route);
    }
  };

  describe('Provider.appRoute', () => {
    describe('ALL', () => {
      it.each(['GET', 'POST', 'DELETE', 'PATCH'])(
        'Expected to redirect to invalid token route if no id token present',
        async (method: 'GET' | 'POST' | 'DELETE' | 'PATCH') => {
          await multiRouteFx(provider.appRoute, method)
            .expect(401)
            .then((response) => {
              expect(response.body).toHaveProperty(
                'message',
                'NO_LTIK_OR_IDTOKEN_FOUND',
              );
            });
        },
      );

      it.each(['GET', 'POST', 'DELETE', 'PATCH'])(
        'Idtoken route is expected to have access to error message',
        async (method: 'GET' | 'POST' | 'DELETE' | 'PATCH') => {
          provider.onInvalidToken((req, res) => {
            res.status(401).send(res.locals.err);
          });

          await multiRouteFx(provider.appRoute, method)
            .expect(401)
            .then((response) => {
              expect(response.body).not.toStrictEqual({});
            });
        },
      );

      it.each(['GET', 'POST', 'DELETE', 'PATCH'])(
        'Expect whitelisted routes to bypass authentication protocol',
        async (method: 'GET' | 'POST' | 'DELETE' | 'PATCH') => {
          provider.whitelist = [
            '/whitelist1',
            { route: '/whitelist2', method: method },
            { route: /^\/whitelist3\/.*/, method: method.toLowerCase() },
          ];
          expect(provider.whitelist).toBeInstanceOf(Array);
          expect(provider.whitelist).toHaveLength(3);

          const cb = (req, res) => {
            return res.sendStatus(200);
          };
          for (const route of provider.whitelist) {
            switch (route.method) {
              case 'GET':
                provider.app.get(route.route, cb);
                break;
              case 'POST':
                provider.app.post(route.route, cb);
                break;
              case 'DELETE':
                provider.app.delete(route.route, cb);
                break;
              case 'PATCH':
                provider.app.patch(route.route, cb);
                break;
              default:
                provider.app.all(route.route, cb);
                break;
            }

            await multiRouteFx(
              route.route instanceof RegExp
                ? '/whitelist3/any'
                : (route.route as string),
              method,
            ).expect(200);
          }
        },
      );

      it.each([
        [
          'Wrong aud claim',
          {
            aud: 'WRONG_CLIENTID',
          },
          undefined,
          undefined,
          'UNREGISTERED_PLATFORM',
        ],
        [
          'Multiple aud claim, wrong azp claim',
          {
            aud: ['ClientId1', 'ClientId2'],
            azp: 'ClientId2',
          },
          undefined,
          undefined,
          'UNREGISTERED_PLATFORM',
        ],
        ['No KID sent in JWT header', {}, null, undefined, 'KID_NOT_FOUND'],
        [
          'Incorrect KID in JWT header',
          {},
          'WRONGKID',
          undefined,
          'KEY_NOT_FOUND',
        ],
        [
          'Wrong LTI Version',
          {
            'https://purl.imsglobal.org/spec/lti/claim/version': '2.3',
          },
          undefined,
          undefined,
          'WRONG_LTI_VERSION_CLAIM',
        ],
        [
          'No LTI Version',
          {
            'https://purl.imsglobal.org/spec/lti/claim/version': null,
          },
          undefined,
          undefined,
          'NO_LTI_VERSION_CLAIM',
        ],
        [
          'Invalid LTI message',
          undefined,
          undefined,
          { name: 'badltilaunch' },
          'ISS_CLAIM_DOES_NOT_MATCH',
        ],
        [
          'Missing LTI Claims',
          {
            'https://purl.imsglobal.org/spec/lti/claim/message_type': null,
          },
          undefined,
          undefined,
          'NO_MESSAGE_TYPE_CLAIM',
        ],
        [
          'Timestamps Incorrect',
          {
            iat: 11111,
            exp: 22222,
          },
          undefined,
          undefined,
          'jwt expired',
        ],
        [
          'Message Type Claim Missing',
          {
            'https://purl.imsglobal.org/spec/lti/claim/message_type': null,
          },
          undefined,
          undefined,
          'NO_MESSAGE_TYPE_CLAIM',
        ],
        [
          'Role Claim Missing',
          {
            'https://purl.imsglobal.org/spec/lti/claim/roles': null,
          },
          undefined,
          undefined,
          'NO_ROLES_CLAIM',
        ],
        [
          'Deployment Id Claim Missing',
          {
            'https://purl.imsglobal.org/spec/lti/claim/deployment_id': null,
          },
          undefined,
          undefined,
          'NO_DEPLOYMENT_ID_CLAIM',
        ],
        [
          'Resource Link Id Claim Missing',
          {
            'https://purl.imsglobal.org/spec/lti/claim/resource_link': null,
          },
          undefined,
          undefined,
          'NO_RESOURCE_LINK_ID_CLAIM',
        ],
        [
          'User Claim Missing',
          {
            sub: null,
          },
          undefined,
          undefined,
          'NO_SUB_CLAIM',
        ],
      ])(
        'Bad JWT Payload: %s. Expected to redirect to invalid token route',
        async (
          _m: string,
          tokenMods?: any,
          kid?: string,
          payloadOverwrite?: any,
          errMsg?: string,
        ) => {
          const response: supertest.Response = (await loginFlow(
            tokenMods,
            undefined,
            payloadOverwrite,
            kid,
            true,
          )) as unknown as supertest.Response;
          expect(response.body).toHaveProperty('message', errMsg);
        },
        10000,
      );

      it.each([
        [' ', {}, undefined],
        [
          ' Has multiple AUD claims. ',
          { aud: ['clientid2', 'clientid3'] },
          undefined,
        ],
      ])(
        'Valid JWT Payload:%sExpected to return 200.',
        async (_m: string, tokenMods: any, redirect?: string) => {
          await loginFlow(tokenMods, redirect);
        },
        10000,
      );
    });
  });
});
