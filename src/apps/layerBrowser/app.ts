import { IContainer } from '../../types';
import { VueApp } from '../vueApp';

import { AppSwitchService } from '../../services/appSwitch';

import Bootstrap  from '../../comps/layerBrowser/comp.vue';

export interface IControlAppStructure {
    [index: string]: string;
}

export class LayerBrowserApp extends VueApp {
    name = 'LayerBrowserApp';

    protected bootstrap = Bootstrap;

    constructor(element?: IContainer | string) {
        super();
        this.insert(element);
    }


}
