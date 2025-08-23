// Express server
import * as express from 'express';
import {createServer, Server as HttpsServer} from 'https';
import {Server as HttpServer} from 'http';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import {Debug} from './debug';

export type SSLType = { key: string; cert: string };

export class Server {
  app: express.Express;

  server?: HttpsServer | HttpServer;
  ssl?: SSLType;

  constructor(
    encryptionKey: string,
    https: boolean = false,
    corsOpt: boolean = true,
    ssl?: SSLType,
    serverAddon?: (...params: any[]) => any,
  ) {
    this.app = express();

    if (https) this.ssl = ssl;

    // Handling URI decode vulnerability
    this.app.use(async (req, res, next) => {
      try {
        decodeURIComponent(req.path);
        return next();
      } catch (err) {
        return res.status(400).send({
          status: 400,
          error: 'Bad Request',
          details: { message: 'URIError: Failed to decode param' },
        });
      }
    });

    // Setting up helmet
    this.app.use(
      helmet({
        frameguard: false, // Disabling frameguard so that Ltijs can send resources to iframes inside LMS's
        contentSecurityPolicy: false,
      }),
    );

    // Controlling cors, having in mind that resources in another domain need to be explicitly allowed, and that ltijs controls origin blocking unregistered platforms
    // This block of code allows cors specifying the host instead of just returnin '*'. And then ltijs blocks requests from unregistered platforms. (Except for whitelisted routes)
    if (corsOpt) {
      this.app.use(
        cors({
          origin: (
            origin: string,
            callback: (
              err: Error | null,
              origin?:
                | boolean
                | string
                | RegExp
                | Array<boolean | string | RegExp>,
            ) => void,
          ) => {
            callback(null, true);
          },
          credentials: true,
        }),
      );
      this.app.options('*', cors());
    }
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.raw());
    this.app.use(bodyParser.text());
    this.app.use(cookieParser(encryptionKey));
    this.app.use(async (req, res, next) => {
      // Creating Authorization schema LTIK-AUTH-V1
      if (req.headers && req.headers.authorization) {
        const headerParts = req.headers.authorization.split(
          'LTIK-AUTH-V1 Token=',
        );
        if (headerParts.length > 1) {
          Debug.log(this, 'Validating LTIK-AUTH-V1 Authorization schema');
          try {
            const tokenBody = headerParts[1];

            // Get ltik
            const tokenBodyParts = tokenBody.split(',');
            req['token'] = tokenBodyParts[0];

            // Get additional Authorization headers
            const additional = tokenBody.split('Additional=');
            if (additional.length > 1)
              req.headers.authorization = additional[1];
          } catch (err) {
            Debug.log(
              this,
              'Error validating LTIK-AUTH-V1 Authorization schema',
            );
            Debug.log(this, err);
          }
        }
      }
      return next();
    });
    this.app.use(async (req, res, next) => {
      // Return if req.token is already defined
      if (req['token']) return next();
      // Attempt to retrieve ltik from query parameters
      if (req.query && req.query.ltik) {
        req['token'] = req.query.ltik;
        return next();
      }
      // Attempt to retrieve ltik from body parameters
      if (req.body && req.body.ltik) {
        req['token'] = req.body.ltik;
        return next();
      }
      // Attempt to retrieve ltik from Bearer Authorization header
      if (req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
          req['token'] = parts[1];
          return next();
        }
      }
      return next();
    });

    // Executing server addon
    if (serverAddon) serverAddon(this.app);
  }

  listen(port: number) {
    return new Promise((resolve, reject) => {
      if (this.ssl) {
        this.server = createServer(this.ssl, this.app).listen(port);
      } else {
        this.server = this.app.listen(port);
      }
      this.server.on('listening', () => {
        resolve(true);
      });
      this.server.on('error', (err: Error) => {
        reject(err);
      });
    });
  }

  setStaticPath(path: string) {
    this.app.use('/', express.static(path, { index: '_' }));
  }

  close() {
    if (this.server) this.server.close();
  }
}
