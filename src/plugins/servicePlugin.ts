import Vue from 'vue';
import pool from '../servicePool';
import { ServiceManager } from '../services/manager';

declare module 'vue/types/vue' {
    interface Vue {
        $services: ServiceManager;
    }
}

export default {
    install: (vue: any, options?: any) => {
        Object.defineProperty(vue.prototype, '$services', {
            get() {
                return pool;
            },
        });
    },
};
