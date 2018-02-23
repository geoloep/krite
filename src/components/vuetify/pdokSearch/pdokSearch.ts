import * as wellknown from 'wellknown';

import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { MapService } from '../../../services/map';
import { PdokLocatieserverService } from '../../../services/pdokLocatieserver';

@Component
export default class PdokSearch extends Vue {
    @Prop({ default: true })
    zoomTo: boolean;

    locatieserver: PdokLocatieserverService;

    searchString = '';

    searchTimeOut: number;
    timeOutLength = 500;
    loading = false;

    results: any[] = [];
    result: any = {};

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
        adres: 'home',
        woonplaats: 'location_on',
        weg: 'timeline',
        gemeente: 'location_on',
        perceel: 'map',
    };

    cursor = {
        depth: 'adres',
        num: 0,
        valid: false,
    };

    currentDepth = 'adres';
    currentNum = 0;

    created() {
        this.locatieserver = this.$services.getService<PdokLocatieserverService>('PdokLocatieserverService');
    }

    @Watch('searchString')
    onSearchStringChanged(val: string, oldVal: string) {
        if (this.searchTimeOut) {
            window.clearTimeout(this.searchTimeOut);
        }

        this.searchTimeOut = window.setTimeout(this.search, this.timeOutLength);
    }

    @Watch('result')
    onResultChanged(val: any) {
        this.searchClick(val);
    }

    async search() {
        if (this.searchString !== null && this.searchString !== '' && this.searchString !== this.result.weergavenaam) {

            this.loading = true;

            try {
                this.searchSuccess(await this.locatieserver.search(this.searchString));
            } catch (e) {
                this.searchFail();
            } finally {
                this.loading = false;
            }

            this.$emit('search', this.searchString);
        }
    }

    /**
     * Load returned search results
     */
    searchSuccess = (data: { [index: string]: any[] }) => {
        this.results.splice(0);

        for (const depth of this.depthOrder) {
            if (data[depth]) {
                for (const item of data[depth]) {
                    this.results.push(item);
                }
            }
        }
    }

    searchClick(context: any) {
        const map = this.$services.getService<MapService>('MapService');

        this.locatieserver.inspect(context.id).then((response) => {
            const geojson = (wellknown.parse(response.response.docs[0].centroide_rd) as GeoJSON.Point);

            if (this.zoomTo) {
                map.zoomToPoint(L.point(geojson.coordinates[0], geojson.coordinates[1]), this.diepteNaarZoom[context.type]);
            }

            this.$emit('result-click', response.response.docs[0], geojson, this.diepteNaarZoom[context.type]);
        });

    }

    /**
     * @todo: implement
     */
    searchFail = () => {
        console.error('Fout bij zoeken');
    }

    filter() {
        return true;
    }
}
