/*
Copyright 2017 Geoloep

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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