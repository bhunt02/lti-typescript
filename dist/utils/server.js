"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const express = require("express");
const https_1 = require("https");
const helmet_1 = require("helmet");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const debug_1 = require("./debug");
class Server {
    constructor(encryptionKey, https = false, corsOpt = true, ssl, serverAddon) {
        this.app = express();
        if (https)
            this.ssl = ssl;
        this.app.use(async (req, res, next) => {
            try {
                decodeURIComponent(req.path);
                return next();
            }
            catch (err) {
                return res.status(400).send({
                    status: 400,
                    error: 'Bad Request',
                    details: { message: 'URIError: Failed to decode param' },
                });
            }
        });
        this.app.use((0, helmet_1.default)({
            frameguard: false,
            contentSecurityPolicy: false,
        }));
        if (corsOpt) {
            this.app.use(cors({
                origin: (origin, callback) => {
                    callback(null, true);
                },
                credentials: true,
            }));
            this.app.options('*', cors());
        }
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.raw());
        this.app.use(bodyParser.text());
        this.app.use(cookieParser(encryptionKey));
        this.app.use(async (req, res, next) => {
            if (req.headers && req.headers.authorization) {
                const headerParts = req.headers.authorization.split('LTIK-AUTH-V1 Token=');
                if (headerParts.length > 1) {
                    debug_1.Debug.log(this, 'Validating LTIK-AUTH-V1 Authorization schema');
                    try {
                        const tokenBody = headerParts[1];
                        const tokenBodyParts = tokenBody.split(',');
                        req['token'] = tokenBodyParts[0];
                        const additional = tokenBody.split('Additional=');
                        if (additional.length > 1)
                            req.headers.authorization = additional[1];
                    }
                    catch (err) {
                        debug_1.Debug.log(this, 'Error validating LTIK-AUTH-V1 Authorization schema');
                        debug_1.Debug.log(this, err);
                    }
                }
            }
            return next();
        });
        this.app.use(async (req, res, next) => {
            if (req['token'])
                return next();
            if (req.query && req.query.ltik) {
                req['token'] = req.query.ltik;
                return next();
            }
            if (req.body && req.body.ltik) {
                req['token'] = req.body.ltik;
                return next();
            }
            if (req.headers.authorization) {
                const parts = req.headers.authorization.split(' ');
                if (parts.length === 2 && parts[0] === 'Bearer') {
                    req['token'] = parts[1];
                    return next();
                }
            }
            return next();
        });
        if (serverAddon)
            serverAddon(this.app);
    }
    listen(port) {
        return new Promise((resolve, reject) => {
            if (this.ssl) {
                this.server = (0, https_1.createServer)(this.ssl, this.app).listen(port);
            }
            else {
                this.server = this.app.listen(port);
            }
            this.server.on('listening', () => {
                resolve(true);
            });
            this.server.on('error', (err) => {
                reject(err);
            });
        });
    }
    setStaticPath(path) {
        this.app.use('/', express.static(path, { index: '_' }));
    }
    close() {
        if (this.server)
            this.server.close();
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map