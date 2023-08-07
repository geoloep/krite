/*
Copyright 2022 Geoloep

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

import SourceBase from '../../bases/source';
import { IDataSource } from '../../types';
import { WFSLayer } from './wfs';
import { WMSLayer } from './wms';
import { WMSOptions } from 'leaflet';
import { XMLService } from '../../services/xml';

export interface IOWSSourceoptions {
    wfs?: boolean | string;
    wms?: boolean | string;
}

export interface IOWSLayeroptions {
    layers?: string;
    maxZoom?: number;
    minZoom?: number;
    wms?: WMSOptions & Record<string, any>;

    [index: string]: any;
}

const servicePattern = '{service}';

export class OWSSource extends SourceBase implements IDataSource {
    protected options!: {
        wms: string;
        wfs: string;
    };

    private parsedCapabilities = false;
    private fetchingCapabilitiesPromise: Promise<void> | null = null;

    private layerNames = new Set<string>();
    private instantiatedLayers: { [index: string]: WMSLayer | WFSLayer } = {};

    private wmsLayers: { [index: string]: Node } = {};
    private wfsLayers: { [index: string]: Node } = {};

    constructor(readonly baseUrl: string, options?: IOWSSourceoptions) {
        super();

        this.options = this.parseBaseUrl(baseUrl);

        if (options) {
            Object.assign(this.options, options);
        }
    }

    async getLayerNames() {
        if (!this.parsedCapabilities) {
            await this.fetchCapabilities();
        }

        // @todo: Change external type to set eventually
        return Array.from(this.layerNames);
    }

    async getLayer(
        name: string,
        options?: IOWSLayeroptions
    ): Promise<WMSLayer | WFSLayer> {
        if (!this.parsedCapabilities) {
            await this.fetchCapabilities();
        }

        if (!options && this.instantiatedLayers[name]) {
            return this.instantiatedLayers[name];
        }

        let layer: WMSLayer | WFSLayer | null = null;

        if (this.wmsLayers[name]) {
            layer = this.createWMSLayer(
                this.wmsLayers[name],
                this.wfsLayers[name],
                options
            );
        } else if (this.wfsLayers[name]) {
            layer = this.createWFSLayer(this.wfsLayers[name]);
        }

        if (layer) {
            if (!options) {
                this.instantiatedLayers[name] = layer;
            }

            return layer;
        }

        throw new Error(`Unknown layer ${name} }`);
    }

    async getCombinedLayer(names: string[], options?: IOWSLayeroptions) {
        if (!this.parsedCapabilities) {
            await this.fetchCapabilities();
        }

        for (const name of names) {
            if (!this.wmsLayers[name]) {
                throw new Error(`Layer ${name} not available`);
            }
        }

        return await this.getLayer(names[0], {
            layers: names.join(','),
            ...options,
        });
    }

    protected createWMSLayer(
        wmsNode: Node,
        wfsNode?: Node,
        options?: IOWSLayeroptions
    ) {
        let wfsLayer: WFSLayer | undefined = undefined;

        if (wfsNode) {
            wfsLayer = this.createWFSLayer(wfsNode);
        }

        const layer = new WMSLayer(
            this.options.wms,
            wmsNode,
            options,
            wfsLayer
        );

        layer.added(this.krite);

        return layer;
    }

    protected createWFSLayer(wfsNode: Node) {
        const layer = new WFSLayer(this.options.wfs, wfsNode);
        layer.added(this.krite);
        return layer;
    }

    /**
     * Create urls for the wms and wfs endpoint
     * @param baseUrl constructor url
     */
    private parseBaseUrl(baseUrl: string) {
        if (baseUrl.indexOf(servicePattern) >= 0) {
            return {
                wfs: baseUrl.replace(servicePattern, 'wfs') as string,
                wms: baseUrl.replace(servicePattern, 'wms') as string,
            };
        } else {
            return {
                wfs: baseUrl,
                wms: baseUrl,
            };
        }
    }

    private fetchCapabilities() {
        if (!this.fetchingCapabilitiesPromise) {
            this.fetchingCapabilitiesPromise = new Promise<void>(
                (resolve, reject) => {
                    const requests: Array<Promise<Response>> = [];

                    if (this.options.wfs) {
                        requests.push(
                            this.fetch(
                                this.options.wfs +
                                    url.format({
                                        query: {
                                            request: 'GetCapabilities',
                                            service: 'WFS',
                                        },
                                    })
                            )
                        );
                    }

                    if (this.options.wms) {
                        requests.push(
                            this.fetch(
                                this.options.wms +
                                    url.format({
                                        query: {
                                            request: 'GetCapabilities',
                                            service: 'WMS',
                                        },
                                    })
                            )
                        );
                    }

                    Promise.all(requests).then((responses) => {
                        const parsing: Promise<void>[] = [];

                        if (this.options.wfs) {
                            if (!responses[0].ok) {
                                reject('Request for WFS capabilities failed');
                                return;
                            }

                            parsing.push(
                                responses[0]
                                    .text()
                                    .then((textValue) => {
                                        this.parseWFSCapabilities(textValue);
                                    })
                                    .catch(() => {
                                        reject(
                                            'WFS Capabilities could not be parsed'
                                        );
                                    })
                            );
                        }

                        if (this.options.wms) {
                            if (!responses.slice(-1)[0].ok) {
                                throw new Error(
                                    'Request for WMS capabilities failed'
                                );
                            }

                            parsing.push(
                                responses
                                    .slice(-1)[0]
                                    .text()
                                    .then((textValue) => {
                                        this.parseWMSCapabilities(textValue);
                                    })
                                    .catch(() => {
                                        reject(
                                            'Could not parse WMS capabilities'
                                        );
                                    })
                            );
                        }

                        Promise.all(parsing).then(() => {
                            this.parsedCapabilities = true;
                            resolve();
                        });
                    });
                }
            );
        }

        return this.fetchingCapabilitiesPromise;
    }

    private parseWMSCapabilities(body: string) {
        const capabilities = new XMLService(body);

        if (this.isException(capabilities)) {
            throw new Error('Exception in remote WMS Server');
        }

        const layerNodes = capabilities.node(
            capabilities.document,
            './wms:WMS_Capabilities/wms:Capability/wms:Layer'
        );

        for (let i = 0; i < layerNodes.snapshotLength; i++) {
            if (layerNodes.snapshotItem(i)) {
                this.parseWMSLayer(
                    capabilities,
                    layerNodes.snapshotItem(i) as Node
                );
            }
        }
    }

    private parseWMSLayer(capabilities: XMLService, node: Node) {
        const name = capabilities.string(node, './wms:Name');

        this.wmsLayers[name] = node;

        if (!this.layerNames.has(name)) {
            this.layerNames.add(name);
        }

        const nestedLayers = capabilities.node(node, './wms:Layer');

        for (let i = 0; i < nestedLayers.snapshotLength; i++) {
            if (nestedLayers.snapshotItem(i)) {
                this.parseWMSLayer(
                    capabilities,
                    nestedLayers.snapshotItem(i) as Node
                );
            }
        }
    }

    private parseWFSCapabilities(body: string) {
        const capabilities = new XMLService(body);

        if (this.isException(capabilities)) {
            throw new Error('Exception in remote WMS Server');
        }

        const layerNodes = capabilities.node(
            capabilities.document,
            './wfs:WFS_Capabilities/wfs:FeatureTypeList/wfs:FeatureType'
        );

        for (let i = 0; i < layerNodes.snapshotLength; i++) {
            if (layerNodes.snapshotItem(i)) {
                this.parseWFSLayer(
                    capabilities,
                    layerNodes.snapshotItem(i) as Node
                );
            }
        }
    }

    private parseWFSLayer(capabilities: XMLService, node: Node) {
        const name = capabilities.string(node, './wfs:Name');

        this.wfsLayers[name] = node;

        if (!this.layerNames.has(name)) {
            this.layerNames.add(name);
        }

        // Also include under namespaceless name
        if (name.includes(':')) {
            this.wfsLayers[name.split(':').pop() as string] = node;
        }
    }

    private isException(xml: XMLService) {
        const exception = xml.node(xml.document, './ows:ExceptionReport');

        return exception.snapshotLength > 0;
    }
}
