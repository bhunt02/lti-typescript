declare module 'fast-url-parser' {
  class Url {
    auth?: string = null;
    slashes?: string = null;
    host?: string = null;
    hostname?: string = null;
    hash?: string = null;
    search?: string = null;
    pathname?: string = null;
    query?: string | object = null;
    port?: string | number = null;
    protocol?: string = null;
    _protocol: string = null;
    _href: string = '';
    _port: number = -1;
    _query: string | object = null;
    _prependSlash: boolean = false;

    parse(
      str: string,
      parseQueryString?: boolean,
      hostDenotesSlash?: boolean,
      disableAutoEscapeChars?: boolean,
    ): Url;
    resolve(relative: string): Url;
    format(): Url;
    resolveObject(relative: string): Url;

    constructor() {
      this._protocol = null;
      this._href = '';
      this._port = -1;
      this._query = null;

      this.auth = null;
      this.slashes = null;
      this.host = null;
      this.hostname = null;
      this.hash = null;
      this.search = null;
      this.pathname = null;

      this._prependSlash = false;
    }
  }

  function parse(
    str: string,
    parseQueryString?: boolean,
    hostDenotesSlash?: boolean,
    disableAutoEscapeChars?: boolean,
  ): Url;
  function resolve(relative: string): Url;
  function format(obj: Partial<Url>): string;
  function resolveObject(relative: string): Url;
}
