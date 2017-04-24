import { IContainer } from '../../types';
import { VueApp } from '../vueApp';

import Bootstrap  from '../../comps/inspector/comp.vue';

export class InspectorApp extends VueApp {
    name = 'InspectorApp';

    protected bootstrap = Bootstrap;

    constructor(element?: IContainer | string) {
        super();
        this.insert(element);
    }
}
