import * as express from "express";
import {Provider, register} from "../src";
import {TestEncryptionKey, TestProviderOptions, TestTypeOrmConfig} from "./testUtils";
import * as supertest from "supertest";
import TestAgent from "supertest/lib/agent";

describe('As Middleware Test', () => {
  let provider: Provider;
  let app: express.Express;
  let srv: any;
  let agent: TestAgent<supertest.Test>;

  beforeEach(async () => {
    provider = await register(TestEncryptionKey,TestTypeOrmConfig,TestProviderOptions);
    app = express();
  });

  afterEach(async () => {
    await provider.close();
    srv.close();
  });

  it('should act as a middleware', async () => {
    const result = await provider.deploy({ serverless: true });
    expect(result).toBeTruthy();

    app.use(provider.app);

    srv = app.listen(3000);
    agent = supertest.agent(srv);

    await agent.get('/').expect(401).then((response) => {
      expect(response.body.message).toEqual('NO_LTIK_OR_IDTOKEN_FOUND');
    });
  });

  it('should act as a middleware at specific routes', async () => {
    const result = await provider.deploy({ serverless: true });
    expect(result).toBeTruthy();

    app.all('/', (_, res) => {
      res.status(200).send('Successfully contacted server!');
    });
    app.use('/middleware',provider.app);

    srv = app.listen(3000);
    agent = supertest.agent(srv);

    await agent.get('/').expect(200).then((response) => expect(response.text).toEqual('Successfully contacted server!'));
    await agent.get('/middleware').expect(401).then((response) => {
      expect(response.body.message).toEqual('NO_LTIK_OR_IDTOKEN_FOUND');
    });
  });
});