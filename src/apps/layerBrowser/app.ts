import { VueConstructor } from 'vue';
import { IContainer } from '../../types';
import { VueApp } from '../vueApp';

import Bootstrap from '../../comps/layerBrowser/comp.vue';
import English from '../../comps/layerBrowser/locales/en_gb';

export {English as en_gb};
export {default as nl_nl} from '../../comps/layerBrowser/locales/nl_nl';

export class LayerBrowserApp extends VueApp {
    name = 'LayerBrowserApp';

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
