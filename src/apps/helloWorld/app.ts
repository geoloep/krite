import { VueConstructor } from 'vue';
import { IContainer } from '../../types';
import { VueApp } from '../vueApp';

import Bootstrap from '../../comps/helloWorld/comp.vue';

export class HelloWorldApp extends VueApp {
    name = 'HelloWorldApp';

    protected bootstrap = Bootstrap;

    constructor(readonly element?: IContainer | string, readonly who: string = 'World', name?: string) {
        super();

        if (name) {
            this.name = name;
        }

        this.props = {
            who,
        };

        super.insert(element);
    };
}
