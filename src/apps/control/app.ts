import { VueConstructor } from 'vue';
import { IContainer } from '../../types';
import { VueApp } from '../vueApp';

import { AppSwitchService } from '../../services/appSwitch';

import Bootstrap from '../../comps/control/comp.vue';
import { IControlAppStructure } from '../../comps/control/script';

export class ControlApp extends VueApp {
    name = 'ControlApp';

    protected bootstrap = Bootstrap;

    constructor(element: IContainer | string, apps: AppSwitchService, structure?: IControlAppStructure) {
        super();

        this.props = {
            apps,
            structure,
        };

        this.insert(element);
    }


}
