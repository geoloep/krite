import * as url from 'url';

import { IDataSource, ILayer } from '../../types';

import { XMLService } from '../../services/xml';

export class OWSSource implements IDataSource {
    private layersLoaded: boolean = false;
    private layerNames: string[] = [];
    private layers: { [index: string]: ILayer } = {};

    constructor(readonly url: string) {
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

        return this.layers[name];
    }

    private async getCapabilities() {
        let getWMSCapabilities = fetch(
            this.url +
            url.format({
                query: {
                    request: 'GetCapabilities',
                    service: 'WMS',
                },
            }),
        );

        let responses: Response[] = await Promise.all([getWMSCapabilities]);

        for (let response of responses) {
            if (!response.ok) {
                throw `Response to ${response.url} not ok`;
            }
        }

        let wmsCapabilities = new XMLService(await responses[0].text());
        let layers = wmsCapabilities.node(wmsCapabilities.document, '//wms:Layer/wms:Layer');

        for (let i = 0; i < layers.snapshotLength; i++) {
            let layer = layers.snapshotItem(i);

            let titel = wmsCapabilities.string(layer, './wms:Title');
            this.layerNames.push(titel);
        }
    }
}
