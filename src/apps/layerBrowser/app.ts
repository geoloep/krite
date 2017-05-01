import { IContainer } from '../../types';
import { VueApp } from '../vueApp';

import Bootstrap  from '../../comps/layerBrowser/comp.vue';

export class LayerBrowserApp extends VueApp {
    name = 'LayerBrowserApp';

    protected bootstrap = Bootstrap;

    constructor(element?: IContainer | string) {
        super();
        this.insert(element);
    }


}
