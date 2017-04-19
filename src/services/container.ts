import { IContainer, IApp } from '../types';

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
