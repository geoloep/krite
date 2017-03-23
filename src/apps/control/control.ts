import * as Ractive from 'ractive';
import { RactiveApp } from '../ractiveApp';

import pool from '../../servicePool';
import { SidebarService } from '../../services/sidebar';

import { IContainer } from '../../types';

export class ControlApp extends RactiveApp {
    name = 'ControlApp';

    service = pool.getService<SidebarService>('SidebarService');

    constructor(readonly element?: IContainer | string) {
        super();
        super.init(element);
        this.service.registerOnChange(this.onChange);
    };

    onChange = (): void => {
        this.ractive.update('apps');
        this.ractive.set('active', this.service.activeName);
    };

    protected createRactive(element: string) {
        this.ractive = new Ractive({
            append: true,
            modifyArrays: true,
            el: element,
            template: require('./template.html'),
            data: {
                active: this.service.activeName,
                apps: this.service.apps,
                activate: this.service.setApp,
            },
        });

        this.ractive.on('activate', this.activate);
    };

    private activate = (e: any) => {
        this.service.setApp(e.resolve().split('.').pop());
    }
}
