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

import { IApp, IContainer } from '../types';

import pool from '../servicePool';
import { WindowService } from './window';

export class ContainerService implements IContainer {
    private app: IApp;

    constructor(private wide: string | IContainer, private narrow: string | IContainer) {
        pool.promiseService<WindowService>('WindowService').then((service) => {
            service.onStateChange(this.onStateChange);
        });
    }

    register(app: IApp) {
        this.app = app;
    }

    deregister() {
        delete this.app;
    }

    private onStateChange = (state: string) => {
        if (this.app) {
            // this.app.detatch();

            if (state === 'wide') {
                this.app.insert(this.wide);
            } else {
                this.app.insert(this.narrow);
            }
        }
    }
}
