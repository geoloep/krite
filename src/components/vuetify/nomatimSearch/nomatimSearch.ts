import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

import pool from '../../../servicePool';
import { MapService } from '../../../services/map';
import { NominatimService } from '../../../services/nominatim';

@Component({
})
export default class NomatimSearch extends Vue {
    map: MapService;
    backend: NominatimService;

    loading = false;
    searchString = '';

    results: any[] = [];
    result = {};

    zoomLevel = 10;

    @Watch('result')
    onResultChange(val: any) {
        this.searchClick(val);
    }

    async created() {
        this.map = await pool.promiseService<MapService>('MapService');
        this.backend = await pool.promiseService<NominatimService>('NominatimService');
    }

    async search() {
        this.results = await this.backend.search(this.searchString);
    }

    searchClick(context: any) {
        const b = context.boundingbox;

        this.map.setPointer(L.latLng(parseFloat(context.lat), parseFloat(context.lon)));
        this.map.map.fitBounds(L.latLngBounds([b[0], b[2]], [b[1], b[3]]), {
            maxZoom: 16,
        });
    }

    filter() {
        return true;
    }

    keyup(event: KeyboardEvent) {
        if (event.keyCode === 13) {
            this.search();
        }
    }
}
