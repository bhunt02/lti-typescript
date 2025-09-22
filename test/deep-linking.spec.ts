import { JwtPayload, verify } from 'jsonwebtoken';
import * as cheerio from 'cheerio';
import { PlatformTestApp, setupAuthenticatedTest } from './testUtils';
import { BaseContentItem, Platform, Provider } from 'index';

describe('DeepLinkingService', () => {
  let provider: Provider;
  let platform: Platform;
  let token: { id_token: any; state: any };
  let cookies: any;

  const item: BaseContentItem = {
    type: 'ltiResourceLink',
    title: 'Resource',
    custom: {
      name: 'Param',
      value: 'Value',
    },
  };

  const init = async (
    getProvider: () => Provider,
    getPlatform: () => Platform,
    getTokenAndState: () => Promise<[{ id_token: any; state: any }, any[]]>,
  ) => {
    provider = getProvider();
    platform = getPlatform();

    PlatformTestApp.setRoute(
      platform.accessTokenEndpoint,
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

    [token, cookies] = await getTokenAndState();
  };

  describe('With DeepLinking Enabled', () => {
    const { supertest, getProvider, getPlatform, getTokenAndState } =
      setupAuthenticatedTest(undefined, { deploy: true }, true, true);

    beforeEach(async () => {
      await init(getProvider, getPlatform, getTokenAndState);
    });

    it('Deep Linking Launch expected to return status 200', async () => {
      provider.onDeepLinking((token, req, res) => {
        return res.sendStatus(200);
      });

      await supertest(cookies.join(';'))
        .post(provider.appRoute)
        .type('json')
        .send(token)
        .redirects(1)
        .expect(200);
    });

    describe('DeepLinking.createDeepLinkingMessage()', () => {
      it('Expected to return valid deep linking jwt', async () => {
        provider.onDeepLinking(async (token, req, res) => {
          try {
            return res.send(
              await provider.DeepLinkingService.createDeepLinkingMessage(
                token,
                item,
                { message: 'Successfully Registered' },
              ),
            );
          } catch (err) {
            console.error(err);
            res.sendStatus(500);
          }
        });

        await supertest(cookies.join(';'))
          .post(provider.appRoute)
          .type('json')
          .send(token)
          .redirects(1)
          .expect(200)
          .then(async (response) => {
            const payload: JwtPayload = verify(
              response.text,
              await platform.platformPublicKey(),
            ) as JwtPayload;
            expect(
              payload[
                'https://purl.imsglobal.org/spec/lti-dl/claim/content_items'
              ],
            ).toContainEqual(item);
            expect(payload.iss).toEqual(platform.clientId);
            expect(payload.aud).toEqual(platform.platformUrl);
          });
      });

      it.each([
        ['idToken', true, false, 'MISSING_ID_TOKEN'],
        ['contentItem', false, true, 'MISSING_CONTENT_ITEMS'],
      ])(
        'Expected to fail if %s is missing',
        async (_m, missingToken, missingContentItem, errorMsg) => {
          provider.onDeepLinking(async (token, req, res) => {
            try {
              return res.send(
                await provider.DeepLinkingService.createDeepLinkingMessage(
                  missingToken ? undefined : token,
                  missingContentItem ? undefined : item,
                  {
                    message: 'Successfully Registered',
                    errMessage: 'Unsuccessful Registration',
                    log: 'Successfully Registered',
                    errLog: 'Unsuccessful Registration',
                  },
                ),
              );
            } catch (err) {
              console.error(err);
              res.status(500).send((err as Error).message);
            }
          });

          await supertest(cookies.join(';'))
            .post(provider.appRoute)
            .type('json')
            .send(token)
            .redirects(1)
            .expect(500)
            .then((response) => {
              expect(response.text).toEqual(errorMsg);
            });
        },
      );
    });

    it('DeepLinking.createDeepLinkingForm expected to return valid deep linking form', async () => {
      const item: BaseContentItem = {
        type: 'ltiResourceLink',
        title: 'Resource',
        custom: {
          name: 'Param',
          value: 'Value',
        },
      };

      provider.onDeepLinking(async (token, req, res) => {
        try {
          return res.send(
            await provider.DeepLinkingService.createDeepLinkingForm(
              token,
              item,
              {
                message: 'Successfully Registered',
              },
            ),
          );
        } catch (err) {
          console.error(err);
          res.sendStatus(500);
        }
      });

      await supertest(cookies.join(';'))
        .post(provider.appRoute)
        .type('json')
        .send(token)
        .redirects(1)
        .expect(200)
        .then(async (response) => {
          const $ = cheerio.load(response.text);

          // Verify the form tag and its attributes
          const form = $('#ltijs_submit');
          expect(form).toHaveLength(1);
          expect(form.attr('style')).toEqual('display: none;');
          expect(form.attr('action')).toEqual('http://localhost:3000/');
          expect(form.attr('method')).toEqual('POST');

          // Verify the input tag and its attributes
          const input = form.find('input[name="JWT"]');
          expect(input).toHaveLength(1);
          const _payload = input.attr('value');

          // Verify the script tag
          const script = $('script');
          expect(script).toHaveLength(1);
          expect(script.html().trim()).toEqual(
            'document.getElementById("ltijs_submit").submit()',
          );

          const payload: JwtPayload = verify(
            _payload,
            await platform.platformPublicKey(),
          ) as JwtPayload;
          expect(
            payload[
              'https://purl.imsglobal.org/spec/lti-dl/claim/content_items'
            ],
          ).toContainEqual(item);
          expect(payload.iss).toEqual(platform.clientId);
          expect(payload.aud).toEqual(platform.platformUrl);
        });
    });
  });

  describe('With DeepLinking Disabled', () => {
    const { supertest, getProvider, getPlatform, getTokenAndState } =
      setupAuthenticatedTest(undefined, { deploy: true }, false, true);

    beforeEach(async () => {
      await init(getProvider, getPlatform, getTokenAndState);
    });

    it('DeepLinking.createDeepLinkingMessage() expected to fail as deepLinkingSettings missing', async () => {
      provider.onDeepLinking(async (token, req, res) => {
        try {
          return res.send(
            await provider.DeepLinkingService.createDeepLinkingMessage(
              token,
              item,
              { message: 'Successfully Registered' },
            ),
          );
        } catch (err) {
          console.error(err);
          res.status(500).send((err as Error).message);
        }
      });

      await supertest(cookies.join(';'))
        .post(provider.appRoute)
        .type('json')
        .send(token)
        .redirects(1)
        .expect(500)
        .then((response) => {
          expect(response.text).toEqual('MISSING_DEEP_LINK_SETTINGS');
        });
    });
  });
});
