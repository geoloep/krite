import * as Ractive from 'ractive';
import { RactiveApp } from '../ractiveApp';

import pool from '../../servicePool';
import { AppSwitchService } from '../../services/appSwitch';

import { IContainer } from '../../types';

export interface IControlAppStructure {
    [index: string]: string;
}

export class ControlApp extends RactiveApp {
    name = 'ControlApp';

    private structure: IControlAppStructure;
    private updateStructure = false;

    constructor(readonly element: IContainer | string, private apps: AppSwitchService, structure?: IControlAppStructure) {
        super();

        if (structure) {
            this.structure = structure;
        } else {
            this.makeStructure();
            this.updateStructure = true;
        }

        super.init(element);
        this.apps.registerOnChange(this.onChange);
    }

    onChange = (): void => {
        if (this.updateStructure) {
            this.makeStructure();
        }

        this.ractive.set({
            active: this.apps.getActiveName(),
            apps: this.structure,
        });
    }

    protected createRactive(element: string) {
        this.ractive = new Ractive({
            append: true,
            modifyArrays: true,
            el: element,
            template: require('./template.html'),
            data: {
                active: this.apps.getActiveName(),
                apps: this.structure,
                // activate: this.apps.setApp,
            },
        });

        this.ractive.on('activate', (e) => {
            this.apps.setApp(e.key.name);
        });
    };

    private activate = (e: any) => {
        this.apps.setApp(e.resolve().split('.').pop());
    }

    private makeStructure() {
        let structure: IControlAppStructure = {};
        let apps = this.apps.getApps();

        for (let app of Object.keys(apps)) {
            structure[app] = app;
        }

        this.structure = structure;
    }
}
