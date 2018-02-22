import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

import pool from '../../../servicePool';
import { MapService } from '../../../services/map';
import { NominatimService } from '../../../services/nominatim';

@Component({
})
export default class NomatmSearch extends Vue {
    map: MapService;
    backend: NominatimService;

    searchString = '';
    num = -1;

    results: any[] = [];

    dropdownStyle = {
        display: 'none',
    };

    zoomLevel = 10;

    created() {
        this.map = pool.getService<MapService>('MapService');
        this.backend = pool.getService<NominatimService>('NominatimService');
    }

    @Watch('searchString')
    onSearchStringChanged() {
        this.num = -1;
    }

    /**
     * Close result dropdown
     */
    inputBlur() {
        this.dropdownStyle.display = 'none';
    }

    /**
     * Open result dropdown
     */
    inputFocus() {
        this.dropdownStyle.display = 'inherit';
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

    searchEnter() {
        if (this.num === -1) {
            this.search();
        } else if (this.results[this.num]) {
            this.searchClick(this.results[this.num]);
        }
    }

    selectUp() {
        if (this.results[this.num - 1]) {
            this.num -= 1;
        }
    }

    selectDown() {
        if (this.results[this.num + 1]) {
            this.num += 1;
        }
    }
}
