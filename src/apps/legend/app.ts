import { IContainer } from '../../types';
import { VueApp } from '../vueApp';

import Bootstrap from '../../comps/legend/comp.vue';
import English from '../../comps/legend/locales/en_gb';

export {English as en_gb};
export {default as nl_nl} from '../../comps/legend/locales/nl_nl';

export class LegendApp extends VueApp {
    name = 'LegendApp';

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
