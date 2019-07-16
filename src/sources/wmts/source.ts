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

        this.layersLoaded = true;
    }

    private async parseCapabilities(data: any) {
        const capabilities = this.capabilities = new XMLService(data);

        const layers = capabilities.node(capabilities.document, './wmts:Capabilities/wmts:Contents/wmts:Layer');

        for (let i = 0; i < layers.snapshotLength; i++) {
            const layer = layers.snapshotItem(i);

            if (layer) {
                const title = capabilities.string(layer, './ows:Title');

                this.layerNames.push(title);

                this.layers[title] = new WMTSLayer(this.baseUrl, layer);
            }
        }
    }
}
