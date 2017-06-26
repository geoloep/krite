import { IContainer } from '../types';
import { VueApp } from '../apps/vueApp';

export interface IAppSwitchServiceCallback {
    (): void;
}

export class AppSwitchService implements IContainer {
    private active: string | undefined;
    private apps: {[index: string]: VueApp} = {};

    private onChangeCallbacks: IAppSwitchServiceCallback[] = [];

    constructor(readonly target?: string) {
    }

    getApps() {
        return this.apps;
    }

    getActiveApp() {
        if (this.active) {
            return this.apps[this.active];
        }
    }

    getActiveName() {
        return this.active;
    }

    register(app: VueApp) {
        if (this.apps[app.name]) {
            console.warn(`Overriding app ${app.name}`);
        }

        this.apps[app.name] = app;

        this.onChange();
    }

    deregister() {
    }

    setApp(appName: string) {
        if (this.apps[appName]) {
            if (appName !== this.active) {
                if (this.active) {
                    this.apps[this.active].detatch();
                }

                this.active = appName;
                this.apps[appName].insert(this.target);
            }
        } else {
            console.warn(`Tried to set unkown app: ${appName}`);
        }

        this.onChange();
    }

    clear() {
        if (this.active) {
            this.apps[this.active].detatch();
        }

        this.active = undefined;
        this.onChange();
    }

    registerOnChange(func: () => void) {
        this.onChangeCallbacks.push(func);
    }

    private onChange() {
        for (let c of this.onChangeCallbacks) {
            c();
        }
    }
}