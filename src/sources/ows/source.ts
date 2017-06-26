import * as url from 'url';

import { IDataSource, ILayer } from '../../types';

import { XMLService } from '../../services/xml';
import { WMSLayer } from './wms';
import { WFSLayer } from './wfs';

export interface IOWSSourceoptions {
    wfs?: boolean;
    wms?: boolean;
}

export class OWSSource implements IDataSource {
    private layersLoaded: boolean = false;
    private layerNames: string[] = [];
    private wmsLayers: { [index: string]: WMSLayer } = {};
    private wfsLayers: { [index: string]: WFSLayer } = {};
    private options = {
        wfs: true,
        wms: true,
    };

    constructor(readonly url: string, options?: IOWSSourceoptions) {
        if (options) {
            Object.assign(this.options, options);
        }
    }

    async getLayerNames() {
        if (!this.layersLoaded) {
            await this.getCapabilities();
        }

        return this.layerNames;
    }

    async getLayer(name: string): Promise<ILayer> {
        if (!this.layersLoaded) {
            await this.getCapabilities();
        }

        return this.wmsLayers[name] || this.wfsLayers[name];
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

        let getWFSCapabilities = fetch(
            this.url +
            url.format({
                query: {
                    request: 'GetCapabilities',
                    service: 'WFS',
                },
            }),
        );

        let responses: Response[] = await Promise.all([getWMSCapabilities, getWFSCapabilities]);

        for (let response of responses) {
            if (response && !response.ok) {
                throw `Response to ${response.url} not ok`;
            }
        }

        if (this.options.wfs) {
            await this.parseWFSCapabilities(await responses[1].text());
        }

        if (this.options.wms) {
            await this.parseWMSCapabilities(await responses[0].text());
        }

        this.layersLoaded = true;
    }

    private async parseWMSCapabilities(text: string) {
        let wmsCapabilities = new XMLService(text);

        let layers = wmsCapabilities.node(wmsCapabilities.document, './wms:WMS_Capabilities/wms:Capability/wms:Layer/wms:Layer');


        for (let i = 0; i < layers.snapshotLength; i++) {
            this.AddWMSLayer(wmsCapabilities, layers.snapshotItem(i));
        }
    }

    private AddWMSLayer(wmsCapabilities: XMLService, layer: Node) {
        let titel = wmsCapabilities.string(layer, './wms:Title');

        this.wmsLayers[titel] = new WMSLayer(this.url, layer, this.wfsLayers[titel]);

        if (this.layerNames.indexOf(titel) === -1) {
            this.layerNames.push(titel);
        }

        let nestedLayers = wmsCapabilities.node(layer, './wms:Layer');

        for (let i = 0; i < nestedLayers.snapshotLength; i++) {
            this.AddWMSLayer(wmsCapabilities, nestedLayers.snapshotItem(i));
        }
    }

    private async parseWFSCapabilities(text: string) {
        let wfsCapabilities = new XMLService(text);

        let layers = wfsCapabilities.node(wfsCapabilities.document, './wfs:WFS_Capabilities/wfs:FeatureTypeList/wfs:FeatureType');

        for (let i = 0; i < layers.snapshotLength; i++) {
            let layer = layers.snapshotItem(i);

            let titel = wfsCapabilities.string(layer, './wms:Title');

            if (this.layerNames.indexOf(titel) === -1) {
                this.layerNames.push(titel);
            }

            this.wfsLayers[titel] = new WFSLayer(this.url, layer);
        }
    }
}