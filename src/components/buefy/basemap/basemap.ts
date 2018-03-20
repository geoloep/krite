import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import pool from '../../../servicePool';
// import { BasemapService } from '../../services/basemap';
import { MapService } from '../../../services/map';

import { IDataSource, ILayer } from '../../../types';

@Component
export default class BasemapComponent extends Vue {
    @Prop()
    source: IDataSource;

    @Prop()
    layers: string[] | undefined;

    @Prop({ default: {} })
    assign: any;

    basemaps: ILayer[] = [];

    mounted() {
        this.loadBasemaps();
    }

    async loadBasemaps() {
        let layers;

        if (this.layers) {
            layers = this.layers;
        } else {
            layers = await this.source.getLayerNames();
        }

        for (const layer of layers) {
            this.basemaps.push(Object.assign(await this.source.getLayer(layer), this.assign));
        }

    }

    setBasemap(context: ILayer) {
        if (this.$listeners.choice) {
            this.$emit('choice', context);
        } else {
            pool.getService<MapService>('MapService').setBaseMap(context);
        }
    }
}
