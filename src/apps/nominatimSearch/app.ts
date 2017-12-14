import { VueConstructor } from 'vue';
import { IContainer } from '../../types';
import { VueApp } from '../vueApp';

import Bootstrap from '../../comps/nominatimSearch/comp.vue';

export class NominatimSearchApp extends VueApp {
    name = 'NominatimSearchApp';

    protected bootstrap = Bootstrap;

    constructor(element?: IContainer | string) {
        super();
        this.insert(element);
    }
}
