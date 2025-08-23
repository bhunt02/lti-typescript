export declare class Debug {
    private enabled;
    constructor(enabled?: boolean);
    private static _DebugInstance;
    static get DebugInstance(): Debug;
    private static set DebugInstance(value);
    static init(debug?: boolean): void;
    static log(caller: any, ...args: any[]): void;
}
