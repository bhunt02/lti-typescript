import { PlatformTestApp, setupAuthenticatedTest } from './testUtils';
import { Platform, Provider } from 'index';

describe('Names And Roles Service', function () {
  const { supertest, getProvider, getPlatform, getTokenAndState } =
    setupAuthenticatedTest(undefined, { deploy: true });
  let provider: Provider;
  let platform: Platform;
  let token: { id_token: any; state: any };
  let cookies: any;

  const membersResult = {
    id: 'http://localhost/moodle/mod/lti/services.php/CourseSection/2/bindings/1/memberships',
    context: { id: '2', label: 'course', title: 'Course' },
    members: [
      {
        status: 'Active',
        roles: [
          'Instructor',
          'http://purl.imsglobal.org/vocab/lis/v2/person#Administrator',
        ],
        user_id: '2',
        lis_person_sourcedid: '',
        name: 'Admin User',
        given_name: 'Admin',
        family_name: 'User',
        email: 'local@moodle.com',
      },
      {
        status: 'Active',
        roles: ['Learner'],
        user_id: '3',
        lis_person_sourcedid: '',
        name: 'test user',
        given_name: 'test',
        family_name: 'user',
        email: 'test@local.com',
      },
    ],
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

    [token, cookies] = await getTokenAndState();
  });

  it('NamesAndRoles.getMembers() expected to throw error if idToken is invalid', async () => {
    provider.onConnect(async (_0, _1, res) => {
      try {
        const result = await provider.NamesAndRolesService.getMembers(
          undefined!,
          {
            role: 'Learner',
            limit: 2,
          },
        );
        return res.send(result);
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
        expect(response.text).toEqual('MISSING_ID_TOKEN');
      });
  });

  it('NamesAndRoles.getMembers() expected to return valid member list', async () => {
    PlatformTestApp.setRoute('/memberships', (req, res) => {
      return res.status(200).send(membersResult);
    });

    provider.onConnect(async (token, req, res) => {
      try {
        return res.send(
          await provider.NamesAndRolesService.getMembers(token, {
            role: 'Learner',
            limit: 2,
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
        expect(response.body.members).toEqual(membersResult.members);
      });
  });

  it('NamesAndRoles.getMembers() should append resourceLinkId query param if resourceLinkId set to true', async () => {
    PlatformTestApp.setRoute('/memberships', (req, res) => {
      expect(req.query['rlid']).toBeTruthy();
      return res.status(200).send(membersResult);
    });

    provider.onConnect(async (token, req, res) => {
      try {
        return res.send(
          await provider.NamesAndRolesService.getMembers(token, {
            role: 'Learner',
            limit: 2,
            resourceLinkId: true,
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

  it('NamesAndRoles.getMembers() expected to return valid member list and include multiple pages', async () => {
    PlatformTestApp.setRoute('/memberships', (req, res) => {
      const links = [
        `<${platform.platformUrl}/memberships?since=623698163>; rel="differences"`,
        `<${platform.platformUrl}/memberships?page=2&per_page=1>; rel="next"`,
        `<${platform.platformUrl}/memberships?page=1&per_page=1>; rel="first"`,
        `<${platform.platformUrl}/memberships?page=2&per_page=1>; rel="last"`,
      ];

      return res
        .status(200)
        .setHeader('link', links.join(','))
        .send(membersResult);
    });

    provider.onConnect(async (token, req, res) => {
      try {
        return res.send(
          await provider.NamesAndRolesService.getMembers(token, {
            role: 'Learner',
            limit: 2,
            pages: 2,
          }),
        );
      } catch (err) {
        console.log(err);
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
        expect(response.body.members).toEqual([
          ...membersResult.members,
          ...membersResult.members,
        ]);
        expect(response.body.differences).toEqual(
          `${platform.platformUrl}/memberships?since=623698163`,
        );
        expect(response.body.members[0]).toEqual(membersResult.members[0]);
        expect(response.body.members[3]).toEqual(membersResult.members[1]);
      });
  });

  it('NamesAndRoles.getMembers() expected to return valid member list and include multiple pages when "pages" parameter is set to undefined', async () => {
    PlatformTestApp.setRoute('/memberships', (req, res) => {
      return res.status(200).send(membersResult);
    });

    provider.onConnect(async (token, req, res) => {
      try {
        return res.send(
          await provider.NamesAndRolesService.getMembers(token, {
            role: 'Learner',
            limit: 2,
            pages: undefined,
          }),
        );
      } catch (err) {
        console.log(err);
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
        expect(response.body.members).toEqual(membersResult.members);
      });
  });

  it('NamesAndRoles.getMembers() expected to return valid member list when using custom url', async () => {
    PlatformTestApp.setRoute('/members_custom', (req, res) => {
      const links = [
        `<${platform.platformUrl}/members_custom?since=623698163>; rel="differences"`,
        `<${platform.platformUrl}/members_custom?page=2&per_page=1>; rel="next"`,
        `<${platform.platformUrl}/members_custom?page=1&per_page=1>; rel="first"`,
        `<${platform.platformUrl}/members_custom?page=2&per_page=1>; rel="last"`,
      ];

      return res
        .status(200)
        .setHeader('link', links.join(','))
        .send(membersResult);
    });

    provider.onConnect(async (token, req, res) => {
      try {
        return res.send(
          await provider.NamesAndRolesService.getMembers(token, {
            role: 'Learner',
            limit: 2,
            url: 'http://localhost:2999/members_custom',
          }),
        );
      } catch (err) {
        console.log(err);
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
        expect(response.body.members).toEqual(membersResult.members);
        expect(response.body.differences).toEqual(
          `${platform.platformUrl}/members_custom?since=623698163`,
        );
      });
  });
});
