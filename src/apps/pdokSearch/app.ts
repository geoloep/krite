import { IContainer } from '../../types';
import { VueApp } from '../vueApp';

import Bootstrap  from './app.vue';

export class PdokSearchApp extends VueApp {
    name = 'PdokSearchApp';

    protected bootstrap = Bootstrap;

    constructor(element?: IContainer | string) {
        super();
        this.insert(element);
    }
}
