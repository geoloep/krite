import { RactiveApp } from '../apps/ractiveApp';

import { IContainer } from '../types';

export interface IApps {
    [index: string]: SidebarServiceApp;
}

export interface ISidebarCallback {
    (): void;
}

export class SidebarServiceApp implements IContainer {
    app: RactiveApp;

    constructor(readonly name: string, readonly label: string, readonly icon: string) {

    }

    register(app: RactiveApp) {
        this.app = app;
    }

    deregister() {
        delete this.app;
    }
}

export class SidebarService {

    apps: IApps = {};

    activeApp: SidebarServiceApp;
    activeName: string;

    private onChangeCallbacks: ISidebarCallback[] = [];

    constructor(readonly target?: string) {
    }

    addApp(app: SidebarServiceApp) {
        this.apps[app.name] = app;
        return app;
    }

    setApp(appName: string) {
        if (this.apps[appName] && this.apps[appName].app) {
            if (this.activeApp) {
                this.activeApp.app.detatch();
            }

            this.activeApp = this.apps[appName];
            this.activeApp.app.insert(this.target);
            this.activeName = appName;
            this.onChange();
        } else {
            console.warn(`Tried to set unkown app: ${appName}`);
        }
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
