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
import { WMTSLayer, WMTSOptions } from './layer';

import { IDataSource } from '../../types';

import SourceBase from '../../bases/source';
import { XMLService } from '../../services/xml';

export class WMTSSource extends SourceBase implements IDataSource {
    capabilities: any | undefined = undefined;

    private layerNames = new Set<string>();
    private layerNodes: { [index: string]: Node } = {};
    private instantiatedLayers: { [index: string]: WMTSLayer } = {};

    private layersLoaded: boolean = false;

    constructor(readonly baseUrl: string, readonly options: any = {}) {
        super();
    }

    async getLayerNames() {
        if (!this.layersLoaded) {
            await this.getCapabilities();
        }

        return Array.from(this.layerNames);
    }

    async getLayer(name: string, options?: WMTSOptions) {
        if (!this.layersLoaded) {
            await this.getCapabilities();
        }

        if (!options && this.instantiatedLayers[name]) {
            return this.instantiatedLayers[name];
        }

        if (this.layerNodes[name]) {
            const layer = new WMTSLayer(this.baseUrl, this.layerNodes[name], options);
            layer.added(this.krite);

            if (!options) {
                this.instantiatedLayers[name] = layer;
            }

            return layer;
        }

        throw new Error(`Unknown layer ${name} }`);
    }

    private async getCapabilities() {
        const response = await this.fetch(this.baseUrl + url.format({
            query: {
                service: 'WMTS',
                request: 'GetCapabilities',
            },
        }));

        if (!response.ok) {
            throw new Error(`Malformed response from capabilties of ${this.baseUrl}`);
        }

        const data = await response.text();

        await this.parseCapabilities(data);

        this.layersLoaded = true;
    }

    private async parseCapabilities(data: any) {
        const capabilities = this.capabilities = new XMLService(data);

        const layers = capabilities.node(capabilities.document, './wmts:Capabilities/wmts:Contents/wmts:Layer');

        for (let i = 0; i < layers.snapshotLength; i++) {
            const layer = layers.snapshotItem(i);

            if (layer) {
                const title = capabilities.string(layer, './ows:Title');

                this.layerNames.add(title);
                this.layerNodes[title] = layer;

                // this.layers[title] = new WMTSLayer(this.baseUrl, layer);
            }
        }
    }
}
