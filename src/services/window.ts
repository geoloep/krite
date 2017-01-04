export interface IStateChangeCallback {
    (newState: string): void;
}

export class WindowService {
    state: string;
    stateChangeCallbacks: IStateChangeCallback[] = [];

    constructor() {
        this.setState();

        window.onresize = this.setState;
    }

    onStateChange(func: IStateChangeCallback) {
        this.stateChangeCallbacks.push(func);
        func(this.state);
    }

    private stateChange(newState: string) {
        if (newState !== this.state) {
            this.state = newState;
            this.stateChanged();
        }
    }

    private stateChanged() {
        for (let callback of this.stateChangeCallbacks) {
            callback(this.state);
        }
    }

    private setState = () => {
        if (window.innerWidth > 991) {
            this.stateChange('wide');
        } else {
            this.stateChange('narrow');
        }
    }
}
