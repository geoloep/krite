import Vue from 'vue';
import pool from '../servicePool';
import { ServiceManager } from '../services/manager';
import { SourceService } from '../services/source';

declare module 'vue/types/vue' {
    interface Vue {
        $sources: SourceService;
    }
}

export default {
    install: (vue: any, options?: any) => {
        Object.defineProperty(vue.prototype, '$sources', {
            get() {
                return pool.getService<SourceService>('SourceService');
            },
        });
    },
};
