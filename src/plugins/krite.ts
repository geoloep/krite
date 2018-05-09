import Vue from 'vue';

import mapPlugin from './mapPlugin';
import servicePlugin from './servicePlugin';
import sourcePlugin from './sourcePlugin';

export default {
    install: (vue: any, options?: any) => {
        Vue.use(mapPlugin);
        Vue.use(servicePlugin);
        Vue.use(sourcePlugin);
    },
};
