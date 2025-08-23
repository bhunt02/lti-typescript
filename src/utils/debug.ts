export class Debug {
  constructor(private enabled: boolean = false) {}

  private static _DebugInstance: Debug;

  static get DebugInstance() {
    return this._DebugInstance;
  }

  private static set DebugInstance(value: Debug) {
    this._DebugInstance = value;
  }

  static init(debug?: boolean) {
    Debug.DebugInstance = new Debug(debug);
  }

  static log(caller: any, ...args: any[]) {
    if (this._DebugInstance === undefined || this._DebugInstance.enabled) {
      args
        .map((arg: any) => {
          if (arg == undefined) return 'undefined';
          if (arg instanceof Error) {
            console.error(caller.constructor.name + ':\n', arg);
          }
        })
        .filter((arg: any) => arg !== undefined);

      console.log(`${caller.constructor.name}:`, args.join(' '));
    }
  }
}
