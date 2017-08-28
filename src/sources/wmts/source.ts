import * as url from 'url';
import { WMTSLayer } from './layer';

import { IDataSource, ILayer } from '../../types';

import { XMLService } from '../../services/xml';

export class WMTSSource implements IDataSource {
    capabilities: any | undefined = undefined;

    private layersLoaded: boolean = false;
    private layerNames: string[] = [];
    private layers: { [index: string]: ILayer } = {};

    constructor(readonly baseUrl: string, readonly options: any = {}) {
    }

    async getLayerNames() {
        if (!this.layersLoaded) {
            await this.getCapabilities();
        }

        return this.layerNames;
    }

    async getLayer(name: string) {
        if (!this.layersLoaded) {
            await this.getCapabilities();
        }

        if (!this.layers[name]) {
            console.error(`Layer ${name} not available`);
        }

        return this.layers[name];
    }

    private async getCapabilities() {
        const response = await fetch(this.baseUrl + url.format({
            query: {
                service: 'WMTS',
                request: 'GetCapabilities',
            },
        }));

        if (!response.ok) {
            console.error('Malformed response');
        }

        const data = await response.text();

        await this.parseCapabilities(data);

        return;
    }

    private async parseCapabilities(data: any) {
        const capabilities = this.capabilities = new XMLService(data);

        const layers = capabilities.node(capabilities.document, './wmts:Capabilities/wmts:Contents/wmts:Layer');

        for (let i = 0; i < layers.snapshotLength; i++) {
            const layer = layers.snapshotItem(i);

            const title = capabilities.string(layer, './ows:Title');

            this.layerNames.push(title);

            this.layers[title] = new WMTSLayer(this.baseUrl, layer);
        }
    }
}
