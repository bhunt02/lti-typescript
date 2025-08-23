"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
var express = require("express");
var https_1 = require("https");
var helmet_1 = require("helmet");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var cors = require("cors");
var debug_1 = require("./debug");
var Server = (function () {
    function Server(encryptionKey, https, corsOpt, ssl, serverAddon) {
        if (https === void 0) { https = false; }
        if (corsOpt === void 0) { corsOpt = true; }
        var _this = this;
        this.app = express();
        if (https)
            this.ssl = ssl;
        this.app.use(function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    decodeURIComponent(req.path);
                    return [2, next()];
                }
                catch (err) {
                    return [2, res.status(400).send({
                            status: 400,
                            error: 'Bad Request',
                            details: { message: 'URIError: Failed to decode param' },
                        })];
                }
                return [2];
            });
        }); });
        this.app.use((0, helmet_1.default)({
            frameguard: false,
            contentSecurityPolicy: false,
        }));
        if (corsOpt) {
            this.app.use(cors({
                origin: function (origin, callback) {
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
        this.app.use(function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var headerParts, tokenBody, tokenBodyParts, additional;
            return __generator(this, function (_a) {
                if (req.headers && req.headers.authorization) {
                    headerParts = req.headers.authorization.split('LTIK-AUTH-V1 Token=');
                    if (headerParts.length > 1) {
                        debug_1.Debug.log(this, 'Validating LTIK-AUTH-V1 Authorization schema');
                        try {
                            tokenBody = headerParts[1];
                            tokenBodyParts = tokenBody.split(',');
                            req['token'] = tokenBodyParts[0];
                            additional = tokenBody.split('Additional=');
                            if (additional.length > 1)
                                req.headers.authorization = additional[1];
                        }
                        catch (err) {
                            debug_1.Debug.log(this, 'Error validating LTIK-AUTH-V1 Authorization schema');
                            debug_1.Debug.log(this, err);
                        }
                    }
                }
                return [2, next()];
            });
        }); });
        this.app.use(function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var parts;
            return __generator(this, function (_a) {
                if (req['token'])
                    return [2, next()];
                if (req.query && req.query.ltik) {
                    req['token'] = req.query.ltik;
                    return [2, next()];
                }
                if (req.body && req.body.ltik) {
                    req['token'] = req.body.ltik;
                    return [2, next()];
                }
                if (req.headers.authorization) {
                    parts = req.headers.authorization.split(' ');
                    if (parts.length === 2 && parts[0] === 'Bearer') {
                        req['token'] = parts[1];
                        return [2, next()];
                    }
                }
                return [2, next()];
            });
        }); });
        if (serverAddon)
            serverAddon(this.app);
    }
    Server.prototype.listen = function (port) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.ssl) {
                _this.server = (0, https_1.createServer)(_this.ssl, _this.app).listen(port);
            }
            else {
                _this.server = _this.app.listen(port);
            }
            _this.server.on('listening', function () {
                resolve(true);
            });
            _this.server.on('error', function (err) {
                reject(err);
            });
        });
    };
    Server.prototype.setStaticPath = function (path) {
        this.app.use('/', express.static(path, { index: '_' }));
    };
    Server.prototype.close = function () {
        if (this.server)
            this.server.close();
    };
    return Server;
}());
exports.Server = Server;
