import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import pool from '../../servicePool';
import { BasemapService } from '../../services/basemap';
import { MapService } from '../../services/map';

import { IBasemap } from '../../types';

@Component
export default class App extends Vue {
    basemaps = pool.getService<BasemapService>('BasemapService').list;

    setBasemap(context: any) {
        pool.getService<MapService>('MapService').setBaseMap(context.url, context.options);
    }
};
