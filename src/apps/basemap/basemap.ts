import * as Ractive from 'ractive';
import { RactiveApp } from '../ractiveApp';

import pool from '../../servicePool';
import { BasemapService } from '../../services/basemap';
import { MapService } from '../../services/map';

import { IContainer } from '../../types';

export class BasemapApp extends RactiveApp {
    private map = pool.getService<MapService>('MapService');
    private service = pool.getService<BasemapService>('BasemapService');

    constructor(readonly element?: IContainer | string) {
        super();
        super.init(element);
    }

    protected createRactive(element: string) {
        this.ractive = new Ractive({
            append: true,
            modifyArrays: true,
            el: element,
            template: require('./template.html'),
            data: {
                basemaps: this.service.list,
            },
        });

        this.ractive.on('setBasemap', (e) => {
            let context = e.get();
            this.map.setBaseMap(context.url, context.options);
        });
    }
}
