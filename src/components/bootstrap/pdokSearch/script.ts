import * as wellknown from 'wellknown';

import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

import pool from '../../../servicePool';
import { MapService } from '../../../services/map';
import { PdokLocatieserverService } from '../../../services/pdokLocatieserver';

@Component
export default class PdokSearch extends Vue {
    @Prop({default: true })
    zoomTo: boolean;

    locatieserver: PdokLocatieserverService;

    searchString = '';

    searchTimeOut: number;
    timeOutLength = 500;

    results: { [index: string]: any[] } = {
        adres: [],
        woonplaats: [],
        weg: [],
        gemeente: [],
        perceel: [],
    };

    dropdownStyle = {
        display: 'none',
    };

    diepteNaarZoom: { [index: string]: number } = {
        adres: 12,
        weg: 12,
        woonplaats: 8,
        gemeente: 8,
        perceel: 12,
    };

    depthOrder = [
        'adres',
        'woonplaats',
        'weg',
        'gemeente',
        'perceel',
    ];

    depthToIcon = {
        adres: 'fa-home',
        woonplaats: 'fa-map-marker',
        weg: 'fa-road',
        gemeente: 'fa-map-marker',
        perceel: 'fa-map-o',
    };

    cursor = {
        depth: 'adres',
        num: 0,
        valid: false,
    };

    currentDepth = 'adres';
    currentNum = 0;

    created() {
        this.locatieserver = pool.getService<PdokLocatieserverService>('PdokLocatieserverService');
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

    @Watch('searchString')
    onSearchStringChanged(val: string, oldVal: string) {
        if (this.dropdownStyle.display === 'none') {
            this.inputFocus();
        }

        if (this.searchTimeOut) {
            window.clearTimeout(this.searchTimeOut);
        }

        if (val !== '') {
            this.searchTimeOut = window.setTimeout(this.search, this.timeOutLength);
        }
    }

    search() {
        this.locatieserver.search(this.searchString).then((response) => {
            this.searchSuccess(response);
        }).catch(this.searchFail);

        this.$emit('search', this.searchString);
    }

    /**
     * Load returned search results
     */
    searchSuccess = (data: { [index: string]: any[] }) => {
        for (const groep in this.results) {
            if (this.results[groep]) {
                // Empty current array
                this.results[groep].splice(0, this.results[groep].length);

                // Check if we can append search results
                if (data[groep]) {
                    for (const r of data[groep]) {
                        this.results[groep].push(r);
                    }
                }
            }
        }

        this.selectReset();
    }

    searchClick(context: any) {
        const map = pool.getService<MapService>('MapService');

        this.locatieserver.inspect(context.id).then((response) => {
            const geojson = (wellknown.parse(response.response.docs[0].centroide_rd) as GeoJSON.Point);

            if (this.zoomTo) {
                map.zoomToPoint(L.point(geojson.coordinates[0], geojson.coordinates[1]), this.diepteNaarZoom[context.type]);
            }

            this.$emit('result-click', response.response.docs[0], geojson, this.diepteNaarZoom[context.type]);
        });

    }

    searchEnter() {
        if (this.cursor.valid) {
            const context = this.results[this.cursor.depth][this.cursor.num];
            this.searchClick(context);
        }
    }

    /**
     * @todo: implement
     */
    searchFail = () => {
        console.error('Fout bij zoeken');
    }

    /**
     * Fired when the user presses the down key in the text input
     */
    selectDown() {
        const nextNum = this.cursor.num + 1;

        if (this.results[this.cursor.depth][nextNum]) {
            // Volgende nummer bestaat binnen de huidige diepte
            this.cursor.num = nextNum;
            this.cursor.valid = true;
        } else {
            // Volgende dieptes proberen
            if (this.depthOrder.indexOf(this.cursor.depth) + 1) {
                for (let i = this.depthOrder.indexOf(this.cursor.depth) + 1; i < this.depthOrder.length; i++) {
                    const nextDepth = this.depthOrder[i];

                    if (this.results[nextDepth].length > 0) {
                        this.cursor.depth = nextDepth;
                        this.cursor.num = 0;
                        this.cursor.valid = true;
                        break;
                    }
                }
            }
        }
    }

    selectReset() {
        this.cursor.valid = false;
        this.cursor.num = 0;

        for (const depth of this.depthOrder) {
            if (this.results[depth].length > 0) {
                this.cursor.depth = depth;
                this.cursor.valid = true;
                break;
            }
        }
    }

    /**
     * Fired when the user presses the up key in the text input
     */
    selectUp() {
        const nextNum = this.cursor.num - 1;

        if (nextNum >= 0 && this.results[this.cursor.depth][nextNum]) {
            // Vorige nummer bestaat binnen de huidige diepte
            this.cursor.num = nextNum;
            this.cursor.valid = true;
        } else {
            // Volgende dieptes proberen
            if (this.depthOrder.indexOf(this.cursor.depth) - 1) {
                for (let i = this.depthOrder.indexOf(this.cursor.depth) - 1; i >= 0; i--) {
                    const nextDepth = this.depthOrder[i];

                    if (this.results[nextDepth].length > 0) {
                        this.cursor.depth = nextDepth;
                        this.cursor.num = this.results[nextDepth].length - 1;
                        this.cursor.valid = true;
                        break;
                    }
                }
            }
        }
    }
}
