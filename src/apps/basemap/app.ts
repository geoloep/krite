import { IContainer } from '../../types';
import { VueApp } from '../vueApp';

import Bootstrap  from '../../comps/basemap/comp.vue';

export class BasemapApp extends VueApp {
    name = 'BasemapApp';

    protected bootstrap = Bootstrap;

    constructor(element?: IContainer | string) {
        super();
        this.insert(element);
    }
}
