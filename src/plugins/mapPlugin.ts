import Vue from 'vue';
import pool from '../servicePool';
import { ServiceManager } from '../services/manager';
import { MapService } from '../services/map';

declare module 'vue/types/vue' {
    interface Vue {
        $map: MapService;
    }
}

export default {
    install: (vue: any, options?: any) => {
        Object.defineProperty(vue.prototype, '$map', {
            get() {
                return pool.getService<MapService>('MapService');
            },
        });
    },
};
