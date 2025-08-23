"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Debug = void 0;
var Debug = (function () {
    function Debug(enabled) {
        if (enabled === void 0) { enabled = false; }
        this.enabled = enabled;
    }
    Object.defineProperty(Debug, "DebugInstance", {
        get: function () {
            return this._DebugInstance;
        },
        set: function (value) {
            this._DebugInstance = value;
        },
        enumerable: false,
        configurable: true
    });
    Debug.init = function (debug) {
        Debug.DebugInstance = new Debug(debug);
    };
    Debug.log = function (caller) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this._DebugInstance === undefined || this._DebugInstance.enabled) {
            args
                .map(function (arg) {
                if (arg == undefined)
                    return 'undefined';
                if (arg instanceof Error) {
                    console.error(caller.constructor.name + ':\n', arg);
                }
            })
                .filter(function (arg) { return arg !== undefined; });
            console.log("".concat(caller.constructor.name, ":"), args.join(' '));
        }
    };
    return Debug;
}());
exports.Debug = Debug;
