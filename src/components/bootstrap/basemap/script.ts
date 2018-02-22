import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import pool from '../../../servicePool';
// import { BasemapService } from '../../services/basemap';
import { MapService } from '../../../services/map';

import { IDataSource, ILayer } from '../../../types';

@Component
export default class BasemapComponent extends Vue {
    // basemaps = pool.getService<BasemapService>('BasemapService').list;

    @Prop()
    source: IDataSource;

    @Prop()
    list: string[] | undefined;

    basemaps: ILayer[] = [];

    mounted() {
        this.loadBasemaps();
    }

    async loadBasemaps() {
        if (this.list) {
            for (let basemap of this.list) {
                this.basemaps.push(await this.source.getLayer(basemap));
            }
        } else {
            for (let basemap of await this.source.getLayerNames()) {
                this.basemaps.push(await this.source.getLayer(basemap));
            }
        }
    }

    setBasemap(context: any) {
        pool.getService<MapService>('MapService').setBaseMap(context);
    }
};
