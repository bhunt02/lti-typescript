import {setupAuthenticatedTest} from './testUtils';
import {Provider} from '../src/provider/provider';
import {Platform} from '../src/utils/platform';

describe('Authentication Integration Test', () => {
  const { supertest, getProvider, getPlatform, getTokenAndState } =
    setupAuthenticatedTest(undefined, { deploy: true });
  let provider: Provider;
  let platform: Platform;
  let token: { id_token: any; state: any };
  let cookies: any;
  let sessionCookie: any;
  let ltik: string;

  beforeEach(async () => {
    provider = getProvider();
    platform = getPlatform();

    provider.onConnect((_, req, res) => {
      return res.status(200).send({
        ltik: res.locals.ltik,
        cookies: req.headers.cookie,
      });
    });
    [token, cookies] = await getTokenAndState();
    const response = await supertest(cookies.join(';'))
      .post(provider.appRoute)
      .send(token)
      .redirects(1)
      .expect(200);
    ltik = response.body.ltik;
    sessionCookie = response.body.cookies;
  });

  it.each([
    'query',
    'body',
    'authorization header (bearer)',
    'authorization header (ltik v1)',
  ])(
    'Server middleware should attempt to get LTIK token from %s',
    async (version) => {
      let base = supertest(sessionCookie).get(provider.appRoute);

      switch (version) {
        case 'query':
          base = base.query({ ltik });
          break;
        case 'body':
          base = base.send({ ltik });
          break;
        case 'authorization header (bearer)':
          base = base.set({ Authorization: 'Bearer ' + ltik });
          break;
        case 'authorization header (ltik v1)':
          base = base.set({ Authorization: `LTIK-AUTH-V1 Token=${ltik}` });
          break;
      }
      await base.expect(200);
    },
  );

  it('Authentication should fail if LTIK is found but session token is not', async () => {
    await supertest()
      .get(provider.appRoute)
      .send({ ltik })
      .expect(401)
      .then((response) => {
        expect(response.body.message).toEqual('Session not found.');
      });
  });

  describe('LTIK found, invalid, whitelisted route processing', () => {
    it('Should attempt to pass to whitelisted route', async () => {
      provider.whitelist = ['/whitelist'];
      provider.app.all('/whitelist', (_, res) => {
        return res.status(200).send('Whitelist');
      });
      await supertest()
        .get('/whitelist')
        .query({ ltik: 'fake-ltik' })
        .expect(200)
        .then((response) => {
          expect(response.text).toEqual('Whitelist');
        });
    });

    it('Should fail if route is not whitelisted', async () => {
      provider.whitelist = [];
      await supertest()
        .get('/whitelist')
        .query({ ltik: 'fake-ltik' })
        .expect(401)
        .then((response) => {
          expect(response.body.message).toEqual('jwt malformed');
        });
    });
  });
});
