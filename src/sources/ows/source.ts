/*
Copyright 2018 Geoloep

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

import url from '../../util/url';

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
        const getWMSCapabilities = fetch(
            this.baseUrl +
            url.format({
                query: {
                    request: 'GetCapabilities',
                    service: 'WMS',
                },
            }),
        );

        const getWFSCapabilities = fetch(
            this.baseUrl +
            url.format({
                query: {
                    request: 'GetCapabilities',
                    service: 'WFS',
                },
            }),
        );

        const responses: Response[] = await Promise.all([getWMSCapabilities, getWFSCapabilities]);

        for (const response of responses) {
            if (response && !response.ok) {
                throw new Error(`Response to ${response.url} not ok`);
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
        const wmsCapabilities = new XMLService(text);

        const layers = wmsCapabilities.node(wmsCapabilities.document, './wms:WMS_Capabilities/wms:Capability/wms:Layer/wms:Layer');

        for (let i = 0; i < layers.snapshotLength; i++) {
            this.AddWMSLayer(wmsCapabilities, layers.snapshotItem(i));
        }
    }

    private AddWMSLayer(wmsCapabilities: XMLService, layer: Node) {
        const name = wmsCapabilities.string(layer, './wms:Name');

        this.wmsLayers[name] = new WMSLayer(this.baseUrl, layer, this.wfsLayers[name]);

        if (this.layerNames.indexOf(name) === -1) {
            this.layerNames.push(name);
        }

        const nestedLayers = wmsCapabilities.node(layer, './wms:Layer');

        for (let i = 0; i < nestedLayers.snapshotLength; i++) {
            this.AddWMSLayer(wmsCapabilities, nestedLayers.snapshotItem(i));
        }
    }

    private async parseWFSCapabilities(text: string) {
        const wfsCapabilities = new XMLService(text);

        if (!this.isException(wfsCapabilities)) {

            const layers = wfsCapabilities.node(wfsCapabilities.document, './wfs:WFS_Capabilities/wfs:FeatureTypeList/wfs:FeatureType');

            for (let i = 0; i < layers.snapshotLength; i++) {
                const layer = layers.snapshotItem(i);

                const name = wfsCapabilities.string(layer, './wms:Name');

                // if (this.layerNames.indexOf(name) === -1) {
                //     this.layerNames.push(name);
                // }

                const wfsLayer = new WFSLayer(this.baseUrl, layer);

                this.wfsLayers[name] = wfsLayer;

                // Also push under a name that's stripped of the namespace, needed when using a geoserver virtual ows
                // service
                if (name.includes(':')) {
                    this.wfsLayers[name.split(':').pop() as string] = wfsLayer;
                }
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
