import * as express from 'express';
import {Server as HttpsServer} from 'https';
import {Server as HttpServer} from 'http';

export type SSLType = {
    key: string;
    cert: string;
};
export declare class Server {
    app: express.Express;
    server?: HttpsServer | HttpServer;
    ssl?: SSLType;
    constructor(encryptionKey: string, https?: boolean, corsOpt?: boolean, ssl?: SSLType, serverAddon?: (...params: any[]) => any);
    listen(port: number): Promise<unknown>;
    setStaticPath(path: string): void;
    close(): void;
}
