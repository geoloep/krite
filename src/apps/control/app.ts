import { IContainer } from '../../types';
import { VueApp } from '../vueApp';

import { AppSwitchService } from '../../services/appSwitch';

import Bootstrap  from './app.vue';

export interface IControlAppStructure {
    [index: string]: string;
}

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
