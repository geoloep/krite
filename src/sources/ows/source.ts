/*
Copyright 2017 Geoloep

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import * as url from 'url';

import { IDataSource, ILayer } from '../../types';

import { XMLService } from '../../services/xml';
import { WFSLayer } from './wfs';
import { WMSLayer } from './wms';

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

    constructor(readonly baseUrl: string, options?: IOWSSourceoptions) {
        if (options) {
            Object.assign(this.options, options);
        }
    }

    // This actually shows the titles, might be confusing?
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
            this.baseUrl +
            url.format({
                query: {
                    request: 'GetCapabilities',
                    service: 'WMS',
                },
            }),
        );

        let getWFSCapabilities = fetch(
            this.baseUrl +
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

        this.wmsLayers[titel] = new WMSLayer(this.baseUrl, layer, this.wfsLayers[titel]);

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

        if (!this.isException(wfsCapabilities)) {

            let layers = wfsCapabilities.node(wfsCapabilities.document, './wfs:WFS_Capabilities/wfs:FeatureTypeList/wfs:FeatureType');

            for (let i = 0; i < layers.snapshotLength; i++) {
                let layer = layers.snapshotItem(i);

                let titel = wfsCapabilities.string(layer, './wms:Title');

                if (this.layerNames.indexOf(titel) === -1) {
                    this.layerNames.push(titel);
                }

                this.wfsLayers[titel] = new WFSLayer(this.baseUrl, layer);
            }
        }
    }

    private isException(xml: XMLService) {
        const exception = xml.node(xml.document, './ows:ExceptionReport');

        if (exception.snapshotLength > 0) {
            return true;
        } else {
            return false;
        }
    }
}
