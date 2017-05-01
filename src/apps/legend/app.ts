import { IContainer } from '../../types';
import { VueApp } from '../vueApp';

import Bootstrap  from '../../comps/legend/comp.vue';

export class LegendApp extends VueApp {
    name = 'LegendApp';

    protected bootstrap = Bootstrap;

    constructor(element?: IContainer | string) {
        super();
        this.insert(element);
    }


}
