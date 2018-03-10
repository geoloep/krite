import { Component, Vue } from 'vue-property-decorator';

import { MapService } from '../../services/map';

@Component
export default class MapComponent extends Vue {
    map: MapService;

    mounted() {
        this.map = this.$services.getService<MapService>('MapService');

        this.map.attatch(this.$refs['map-container'] as HTMLElement, true);
    }

    beforeDestroy() {
        this.map.detatch();
    }
}
