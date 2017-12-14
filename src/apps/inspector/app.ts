import { VueConstructor } from 'vue';
import { IContainer } from '../../types';
import { VueApp } from '../vueApp';

import Bootstrap from '../../comps/inspector/comp.vue';
import English from '../../comps/inspector/locales/en_gb';

export { English as en_gb };
export { default as nl_nl } from '../../comps/inspector/locales/nl_nl';

export class InspectorApp extends VueApp {
    name = 'InspectorApp';

    props = {
        locale: English,
    };

    protected bootstrap = Bootstrap;

    constructor(element?: IContainer | string, props = {}) {
        super();

        Object.assign(this.props, props);

        this.insert(element);
    }
}
