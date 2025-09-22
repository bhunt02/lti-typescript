import { PlatformTestApp, setupAuthenticatedTest } from './testUtils';
import { Platform, Provider, ScoreType } from 'index';

describe('GradeService', () => {
  const { supertest, getProvider, getPlatform, getTokenAndState } =
    setupAuthenticatedTest(undefined, { deploy: true });
  let provider: Provider;
  let platform: Platform;
  let token: { id_token: any; state: any };
  let cookies: any;

  const lineItemsResponse = [
    {
      id: 'http://localhost/moodle/mod/lti/services.php/2/lineitems/2/lineitem?type_id=1',
      label: 'LTI',
      scoreMaximum: 100,
      resourceId: '',
      tag: '',
      resourceLinkId: '1',
      ltiLinkId: '1',
    },
    {
      id: 'http://localhost/moodle/mod/lti/services.php/2/lineitems/16/lineitem?type_id=1',
      label: 'Chapter 5 Test',
      scoreMaximum: 100,
      resourceId: '24a420e7066b42a09f8c71e9a20b1498',
      tag: 'grade',
      resourceLinkId: '51',
      ltiLinkId: '51',
    },
  ];

  const newLineItem = {
    id: 'https://lms.example.com/context/2923/lineitems/1',
    scoreMaximum: 100,
    label: 'Grade',
    tag: 'grade',
  };

  beforeEach(async () => {
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

    PlatformTestApp.setRoute(
      '/lineitems',
      (_, res) => {
        res
          .status(200)
          .set(
            'Content-Type',
            'application/vnd.ims.lis.v2.lineitemcontainer+json',
          )
          .send(lineItemsResponse);
      },
      'GET',
    );

    PlatformTestApp.setRoute(
      '/lineitems/:id([0-9])/lineitem',
      (req, res) => {
        const id = parseInt(req.params.id);
        const item = lineItemsResponse[id];
        if (!item) res.sendStatus(404);
        else
          return res
            .status(200)
            .set('Content-Type', 'application/vnd.ims.lis.v2.lineitem+json')
            .send(item);
      },
      'GET',
    );

    [token, cookies] = await getTokenAndState();
  });

  describe('Grades.getLineItems()', () => {
    it('Expected to return valid lineitem list', async () => {
      provider.onConnect(async (token, _, res) => {
        try {
          return res.status(200).send(
            await provider.GradeService.getLineItems(token, {
              tag: 'tag',
              resourceId: true,
              resourceLinkId: true,
              limit: 5,
              id: '1',
            }),
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
        .then((response) => {
          expect(response.body.lineItems).not.toBe(undefined);
        });
    });

    it('Expected to return valid lineitem list from custom url', async () => {
      PlatformTestApp.setRoute(
        '/custom_lineitems',
        (_, res) => {
          res
            .status(200)
            .set(
              'Content-Type',
              'application/vnd.ims.lis.v2.lineitemcontainer+json',
            )
            .send(lineItemsResponse);
        },
        'GET',
      );

      provider.onConnect(async (token, _, res) => {
        try {
          return res.status(200).send(
            await provider.GradeService.getLineItems(token, {
              tag: 'tag',
              url: `${platform.platformUrl}/custom_lineitems`,
            }),
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
        .expect(200);
    });

    it('Expected to fail if invalid idToken is missing', async () => {
      provider.onConnect(async (_0, _1, res) => {
        try {
          return res.send(await provider.GradeService.getLineItems(undefined!));
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
          expect(response.text).toStrictEqual('MISSING_ID_TOKEN');
        });
    });
  });

  describe('Grades.getLineItemById()', () => {
    it.each([
      ['succeed', 200],
      ['fail', 500],
    ])(
      'Expected to %s (return a valid lineitem if id exists)',
      async (_, code) => {
        provider.onConnect(async (token, _1, res) => {
          try {
            return res.send(
              await provider.GradeService.getLineItemById(
                token,
                `${platform.platformUrl}/lineitems/${code == 500 ? 2 : 1}/lineitem?tag=tag`,
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
          .expect(code)
          .then((response) => {
            if (code != 500) {
              expect(response.body).toStrictEqual(lineItemsResponse[1]);
            }
          });
      },
    );

    it.each([
      ['idToken', true, false, 'MISSING_ID_TOKEN'],
      ['lineitem ID', false, true, 'MISSING_LINEITEM_ID'],
    ])(
      'Expected to fail if %s missing',
      async (_m, missingToken, missingId, errorMsg) => {
        provider.onConnect(async (token, _1, res) => {
          try {
            return res.send(
              await provider.GradeService.getLineItemById(
                missingToken ? undefined! : token,
                missingId
                  ? undefined
                  : `${platform.platformUrl}/lineitems/1/lineitem?tag=tag`,
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
            expect(response.text).toStrictEqual(errorMsg);
          });
      },
    );
  });

  describe('Grades.updateLineItemById()', () => {
    it('Expected to return valid updated lineitem', async () => {
      PlatformTestApp.setRoute(
        '/lineitems/:id([0-9])/lineitem',
        (req, res) => {
          const id = req.params.id;
          const item = lineItemsResponse[id];
          if (!item) res.sendStatus(404);
          else
            return res
              .status(200)
              .set('Content-Type', 'application/vnd.ims.lis.v2.lineitem+json')
              .send(item);
        },
        'PUT',
      );

      provider.onConnect(async (token, _, res) => {
        try {
          return res.send(
            await provider.GradeService.updateLineItemById(
              token,
              'http://localhost:2999/lineitems/1/lineitem',
              lineItemsResponse[1],
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
        .then((response) => {
          expect(response.body).toStrictEqual(lineItemsResponse[1]);
        });
    }, 10000);

    it.each([
      ['idToken', true, false, false, 'MISSING_ID_TOKEN'],
      ['line item ID', false, true, false, 'MISSING_LINEITEM_ID'],
      ['update params', false, false, true, 'MISSING_LINE_ITEM'],
    ])(
      'Expected to fail if %s missing',
      async (_m, missingToken, missingId, missingParams, errorMsg) => {
        provider.onConnect(async (token, _, res) => {
          try {
            return res.send(
              await provider.GradeService.updateLineItemById(
                missingToken ? undefined : token,
                missingId
                  ? undefined
                  : 'http://localhost:2999/lineitems/1/lineitem',
                missingParams ? undefined : lineItemsResponse[1],
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

  describe('Grades.deleteLineItemById()', () => {
    it('Expected to return valid updated lineitem', async () => {
      PlatformTestApp.setRoute(
        '/lineitems/:id([0-9])/lineitem',
        (req, res) => {
          const id = req.params.id;
          const item = lineItemsResponse[id];
          if (!item) res.sendStatus(404);
          else return res.sendStatus(204);
        },
        'DELETE',
      );

      provider.onConnect(async (token, _, res) => {
        try {
          return res
            .status(204)
            .send(
              await provider.GradeService.deleteLineItemById(
                token,
                'http://localhost:2999/lineitems/1/lineitem?type_id=1',
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
        .expect(204);
    });

    it.each([
      ['idToken', true, false, 'MISSING_ID_TOKEN'],
      ['line item ID', false, true, 'MISSING_LINEITEM_ID'],
    ])(
      'Expected to fail if %s missing',
      async (_m, missingToken, missingId, errorMsg) => {
        provider.onConnect(async (token, _, res) => {
          try {
            return res.send(
              await provider.GradeService.deleteLineItemById(
                missingToken ? undefined : token,
                missingId
                  ? undefined
                  : 'http://localhost:2999/lineitems/1/lineitem',
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

  describe('Grades.createLineItem()', () => {
    it('Expected to return newly created lineItem', async () => {
      PlatformTestApp.setRoute(
        '/lineitems',
        (req, res) => {
          res
            .status(200)
            .set('Content-Type', 'application/vnd.ims.lis.v2.lineitem+json')
            .send(req.body);
        },
        'POST',
      );

      provider.onConnect(async (token, _, res) => {
        try {
          return res.send(
            await provider.GradeService.createLineItem(token, newLineItem),
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
        .then((response) => {
          expect(response.body).toStrictEqual(newLineItem);
        });
    });

    it.each([
      ['idToken', true, false, 'MISSING_ID_TOKEN'],
      ['create params', false, true, 'MISSING_LINE_ITEM'],
    ])(
      'Expected to fail if %s missing',
      async (_m, missingToken, missingItem, errorMsg) => {
        provider.onConnect(async (token, _1, res) => {
          try {
            return res.send(
              await provider.GradeService.createLineItem(
                missingToken ? undefined! : token,
                missingItem ? undefined : newLineItem,
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
            expect(response.text).toStrictEqual(errorMsg);
          });
      },
    );
  });

  describe('Grades.submitScore()', () => {
    const grade: ScoreType = {
      timestamp: '',
      userId: '12345',
      scoreGiven: 90,
      scoreMaximum: 100,
      activityProgress: 'Completed',
      gradingProgress: 'FullyGraded',
    };

    it('Expected to return score', async () => {
      PlatformTestApp.setRoute(
        '/lineitems/:id([0-9])/lineitem/scores',
        (req, res) => {
          res
            .status(200)
            .set('Content-Type', 'application/vnd.ims.lis.v2.score+json')
            .send({
              id: 'https://lms.example.com/context/2923/lineitems/1',
              ...req.body,
            });
        },
        'POST',
      );

      provider.onConnect(async (token, _, res) => {
        try {
          return res.send(
            await provider.GradeService.submitScore(
              token,
              `${platform.platformUrl}/lineitems/1/lineitem?type_id=1`,
              grade,
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
        .then((response) => {
          expect(response.body.scoreGiven).toEqual(90);
        });
    });

    it('Expected to return score with calling user being score recipient if user not specified', async () => {
      PlatformTestApp.setRoute(
        '/lineitems/:id([0-9])/lineitem/scores',
        (req, res) => {
          res
            .status(200)
            .set('Content-Type', 'application/vnd.ims.lis.v2.score+json')
            .send({
              id: 'https://lms.example.com/context/2923/lineitems/1',
              ...req.body,
            });
        },
        'POST',
      );

      provider.onConnect(async (token, _, res) => {
        try {
          return res.send(
            await provider.GradeService.submitScore(
              token,
              `${platform.platformUrl}/lineitems/1/lineitem?type_id=1`,
              {
                ...grade,
                userId: undefined!,
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
        .then((response) => {
          expect(response.body.userId).toEqual('2');
        });
    });

    it.each([
      ['idToken', true, false, false, 'MISSING_ID_TOKEN'],
      ['lineitem ID', false, true, false, 'MISSING_LINEITEM_ID'],
      ['score item', false, false, true, 'MISSING_SCORE'],
    ])(
      'Expected to fail if %s missing',
      async (_m, missingToken, missingId, missingScore, errorMsg) => {
        provider.onConnect(async (token, _1, res) => {
          try {
            return res.send(
              await provider.GradeService.submitScore(
                missingToken ? undefined! : token,
                missingId
                  ? undefined
                  : `${platform.platformUrl}/lineitems/1/lineitem?type_id=1`,
                missingScore ? undefined : grade,
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
            expect(response.text).toStrictEqual(errorMsg);
          });
      },
    );
  });

  describe('Grades.getScores()', () => {
    const results = [
      {
        id: 'http://localhost/moodle/mod/lti/services.php/2/lineitems/16/lineitem/results?type_id=1&user_id=2',
        resultMaximum: 100,
        resultScore: 100,
        scoreOf:
          'http://localhost/moodle/mod/lti/services.php/2/lineitems/16/lineitem?type_id=1',
        timestamp: '2020-06-02T10:51:08-03:00',
        userId: '2',
      },
    ];

    it('Expected to return results array', async () => {
      PlatformTestApp.setRoute(
        '/lineitems/:id([0-9])/lineitem/results',
        (_, res) => {
          res
            .status(200)
            .set(
              'Content-Type',
              'application/vnd.ims.lis.v2.resultcontainer+json',
            )
            .send(results);
        },
        'GET',
      );

      provider.onConnect(async (token, _0, res) => {
        try {
          return res.send(
            await provider.GradeService.getScores(
              token,
              'http://localhost:2999/lineitems/1/lineitem?type_id=1',
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
        .then((response) => {
          expect(response.body).toStrictEqual({
            scores: results,
          });
        });
    });

    it.each([
      ['idToken', true, false, 'MISSING_ID_TOKEN'],
      ['lineitem ID', false, true, 'MISSING_LINEITEM_ID'],
    ])(
      'Expected to fail if missing %s',
      async (_m, missingToken, missingId, errorMsg) => {
        provider.onConnect(async (token, _0, res) => {
          try {
            return res.send(
              await provider.GradeService.getScores(
                missingToken ? undefined : token,
                missingId
                  ? undefined
                  : 'http://localhost:2999/lineitems/1/lineitem?type_id=1',
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
});
