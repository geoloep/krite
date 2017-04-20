import * as wellknown from 'wellknown';

import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

import pool from '../../servicePool';
import { MapService } from '../../services/map';
import { PdokLocatieserverService } from '../../services/pdokLocatieserver';

@Component({
})
export default class App extends Vue {
    locatieserver =  pool.getService<PdokLocatieserverService>('PdokLocatieserverService');

    searchString = '';

    searchTimeOut: number;
    timeOutLength = 500;

    results: {[index: string]: any[]} = {
        adres: [],
        woonplaats: [],
        weg: [],
        gemeente: [],
    };

    dropdownStyle = {
        display: 'none',
    };

    diepteNaarZoom: {[index: string]: number} = {
        adres: 12,
        weg: 12,
        woonplaats: 8,
        gemeente: 8,
    };

    depthOrder = [
        'adres',
        'woonplaats',
        'weg',
        'gemeente',
    ];

    depthToIcon = {
        adres: 'fa-home',
        woonplaats: 'fa-map-marker',
        weg: 'fa-road',
        gemeente: 'fa-map-marker',
    };

    cursor = {
        depth: 'adres',
        num: 0,
        valid: false,
    };

    currentDepth = 'adres';
    currentNum = 0;

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
    }

    /**
     * Load returned search results
     */
    searchSuccess = (data: {[index: string]: any[]}) => {
        for (let groep in this.results) {
            if (this.results[groep]) {
                // Empty current array
                this.results[groep].splice(0, this.results[groep].length);

                // Check if we can append search results
                if (data[groep]) {
                    for (let r of data[groep]) {
                        this.results[groep].push(r);
                    }
                }
            }
        }

        this.selectReset();
    }

    searchClick(context: any) {
        let map = pool.getService<MapService>('MapService');

        this.locatieserver.inspect(context.id).then((response) => {
            let geojson = (wellknown.parse(response.response.docs[0].centroide_rd) as GeoJSON.Point);

            map.zoomToPoint(L.point(geojson.coordinates[0], geojson.coordinates[1]) , this.diepteNaarZoom[context.type]);
        });
    }

    searchEnter() {
        if (this.cursor.valid) {
            let context = this.results[this.cursor.depth][this.cursor.num];
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
        let nextNum = this.cursor.num + 1;
        // let currentDepth = this.ractive.get('currentDepth');

        if (this.results[this.cursor.depth][nextNum]) {
            // Volgende nummer bestaat binnen de huidige diepte
            this.cursor.num = nextNum;
            this.cursor.valid = true;
        } else {
            // Volgende dieptes proberen
            if (this.depthOrder.indexOf(this.cursor.depth) + 1) {
                for (let i = this.depthOrder.indexOf(this.cursor.depth) + 1; i < this.depthOrder.length; i++) {
                    let nextDepth = this.depthOrder[i];

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

        for (let depth of this.depthOrder) {
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
        let nextNum = this.cursor.num - 1;
        // let currentDepth = this.ractive.get('currentDepth');

        if (nextNum >= 0 && this.results[this.cursor.depth][nextNum]) {
            // Vorige nummer bestaat binnen de huidige diepte
            this.cursor.num = nextNum;
            this.cursor.valid = true;
        } else {
            // Volgende dieptes proberen
            if (this.depthOrder.indexOf(this.cursor.depth) - 1) {
                for (let i = this.depthOrder.indexOf(this.cursor.depth) - 1; i >= 0; i--) {
                    let nextDepth = this.depthOrder[i];

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
};
