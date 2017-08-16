import { IContainer, IDataSource } from '../../types';
import { VueApp } from '../vueApp';

import Bootstrap  from '../../comps/basemap/comp.vue';

export class BasemapApp extends VueApp {
    name = 'BasemapApp';

    protected bootstrap = Bootstrap;

    constructor(element: IContainer | string, source: IDataSource, list?: string[]) {
        super();

        this.props = {
            source,
            list,
        }

        this.insert(element);
    }
}
