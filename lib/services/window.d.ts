export interface IStateChangeCallback {
    (newState: string): void;
}
export declare class WindowService {
    state: string;
    stateChangeCallbacks: IStateChangeCallback[];
    constructor();
    onStateChange(func: IStateChangeCallback): void;
    private stateChange(newState);
    private stateChanged();
    private setState;
}
