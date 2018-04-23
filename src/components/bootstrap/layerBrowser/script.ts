import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

import { ILayer } from '../../../types';

import pool from '../../../servicePool';

import { AppSwitchService } from '../../../services/appSwitch';
import { MapService } from '../../../services/map';
import { SourceService } from '../../../services/source';

import en from './locales/en_gb';

@Component
export default class LayerBrowser extends Vue {
    service: SourceService;
    map: MapService;
    sidebar: AppSwitchService | undefined;

    status = {
        sourceLoading: false,
        layerLoading: false,
        layerAddable: false,
    };

    layerFilter = '';
    layerList: string[] = [];

    @Prop({default: () => en})
    locale: any;

    selected = this.locale.dummy_layer;

    created() {
        this.service = pool.getService<SourceService>('SourceService');
        this.map = pool.getService<MapService>('MapService');
        this.sidebar = pool.tryService<AppSwitchService>('AppSwitchService');
    }

    @Watch('selected.source')
    async onSourceChange() {
        if (this.selected.source !== '') {
            this.status.sourceLoading = true;

            const layerNames = await this.service.get(this.selected.source).getLayerNames();

            this.layerList.splice(0, this.layerList.length);

            for (const layer of layerNames) {
                this.layerList.push(layer);
            }

            this.status.sourceLoading = false;
        } else {
            // uitzetten
        }

    }

    get filteredLayerList() {
        const list: string[] = [];

        for (const layer of this.layerList) {
            if (layer.indexOf(this.layerFilter) >= 0) {
                list.push(layer);
            }
        }

        return list;
    }

    get permalink() {
        return `http://${window.location.hostname}${window.location.pathname}?source=${this.selected.source}&layer=${this.selected.name}&fitBounds=true`;
    }

    async selectLayer(name: string) {
        this.selected.name = name;
        this.status.layerAddable = false;
        this.status.layerLoading = true;

        const layer = await this.service.get(this.selected.source).getLayer(name);

        this.selected.layer = layer;
        this.status.layerLoading = false;
        this.status.layerAddable = true;
    }

    addLayer() {
        this.map.addLayer((this.selected.layer as ILayer));

        if (this.sidebar) {
            this.sidebar.setApp('LegendApp');
        }
    }
}
