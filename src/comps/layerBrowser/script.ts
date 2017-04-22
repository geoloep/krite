import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

import { ILayer } from '../../types';

import pool from '../../servicePool';

import { MapService } from '../../services/map';
import { SidebarService } from '../../services/sidebar';
import { SourceService } from '../../services/source';

@Component
export default class App extends Vue {
    service = pool.getService<SourceService>('SourceService');
    map = pool.getService<MapService>('MapService');
    sidebar = pool.tryService<SidebarService>('SidebarService');

    status = {
        sourceLoading: false,
        layerLoading: false,
        layerAddable: false,
    };

    selected = {
        source: '',
        name: 'Info',
        layer: {
            abstract: 'Kies een databron en vervolgens een kaartlaag om informatie aan de kaart toe te voegen.',
            preview: '',
            name: '',
            title: 'Selecteer een laag',
        },
    };

    layerFilter = '';
    layerList: string[] = [];

    @Watch('selected.source')
    async onSourceChange() {
        if (this.selected.source !== '') {
            this.status.sourceLoading = true;

            let layerNames = await this.service.sources[this.selected.source].getLayerNames();

            this.layerList.splice(0, this.layerList.length);

            for (let layer of layerNames) {
                this.layerList.push(layer);
            }

            this.status.sourceLoading = false;
        } else {
            // uitzetten
        }

    }

    get filteredLayerList() {
        let list: string[] = [];

        for (let layer of this.layerList) {
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

        let layer =  await this.service.sources[this.selected.source].getLayer(name);

        this.selected.layer = layer;
        this.status.layerLoading = false;
        this.status.layerAddable = true;
    }

    addLayer() {
        this.map.addLayer((this.selected.layer as ILayer));
    }

    
};
