"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Debug = void 0;
class Debug {
    constructor(enabled = false) {
        this.enabled = enabled;
    }
    static get DebugInstance() {
        return this._DebugInstance;
    }
    static set DebugInstance(value) {
        this._DebugInstance = value;
    }
    static init(debug) {
        Debug.DebugInstance = new Debug(debug);
    }
    static log(caller, ...args) {
        if (this._DebugInstance === undefined || this._DebugInstance.enabled) {
            args
                .map((arg) => {
                if (arg == undefined)
                    return 'undefined';
                if (arg instanceof Error) {
                    console.error(caller.constructor.name + ':\n', arg);
                }
            })
                .filter((arg) => arg !== undefined);
            console.log(`${caller.constructor.name}:`, args.join(' '));
        }
    }
}
exports.Debug = Debug;
//# sourceMappingURL=debug.js.map