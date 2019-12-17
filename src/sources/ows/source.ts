import url from '../../util/url';

import { XMLService } from '../../services/xml';
import { IDataSource } from '../../types';
import { WFSLayer } from './wfs';
import { WMSLayer } from './wms';

export interface IOWSSourceoptions {
    wfs?: boolean | string;
    wms?: boolean | string;
}

export interface IOWSLayeroptions {
    transparant?: boolean;
    minZoom?: number;
    maxZoom?: number;
    layers?: string;
}

const defaultLayerOptions = {
    transparant: true,
};

const defaultOptions: IOWSSourceoptions = {

};

const servicePattern = '{service}';

export class OWSSource implements IDataSource {
    private options!: {
        wms: string,
        wfs: string,
    };

    private parsedCapabilities = false;

    private layerNames = new Set<string>();
    private instantiatedLayers: { [index: string]: WMSLayer | WFSLayer } = {};

    private wmsLayers: { [index: string]: Node } = {};
    private wfsLayers: { [index: string]: Node } = {};

    constructor(readonly baseUrl: string, options?: IOWSSourceoptions) {
        this.options = this.parseBaseUrl(baseUrl);

        if (options) {
            Object.assign(this.options, options);
        }
    }

    async getLayerNames() {
        if (!this.parsedCapabilities) {
            await this.parseCapabilities();
        }

        // @todo: Change external type to set eventually
        return Array.from(this.layerNames);
    }

    async getLayer(name: string, options?: IOWSLayeroptions): Promise<WMSLayer | WFSLayer> {
        if (!this.parsedCapabilities) {
            await this.parseCapabilities();
        }

        if (!options && this.instantiatedLayers[name]) {
            return this.instantiatedLayers[name];
        }

        let layer: WMSLayer | WFSLayer | null = null;

        if (this.wmsLayers[name]) {
            layer = new WMSLayer(
                this.options.wms,
                this.wmsLayers[name],
                options,
                this.wfsLayers[name] ? new WFSLayer(this.baseUrl, this.wfsLayers[name]) : undefined,
            );
        } else if (this.wfsLayers[name]) {
            layer = new WFSLayer(
                this.options.wfs,
                this.wfsLayers[name],
                options,
            );
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
            await this.parseCapabilities();
        }

        for (const name of names) {
            if (!this.wmsLayers[name]) {
                throw new Error(`Layer ${name} not available`);
            }
        }

        const layer = await this.getLayer(names[0], {
            layers: names.join(','),
            ...options,
        });

        return layer;
    }

    /**
     * Create url's for the wms and wfs endpoint
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

    private async parseCapabilities() {
        const requests: Array<Promise<Response>> = [];

        if (this.options.wfs) {
            requests.push(
                fetch(
                    this.options.wfs +
                    url.format({
                        query: {
                            request: 'GetCapabilities',
                            service: 'WFS',
                        },
                    }),
                ),
            );
        }

        if (this.options.wms) {
            requests.push(
                fetch(
                    this.options.wms +
                    url.format({
                        query: {
                            request: 'GetCapabilities',
                            service: 'WMS',
                        },
                    }),
                ),
            );
        }

        const responses: Response[] = await Promise.all(requests);

        if (this.options.wfs) {
            if (!responses[0].ok) {
                throw new Error('Request for WFS capabilties failed');
            }

            try {
                this.parseWFSCapabilities(
                    await responses[0].text(),
                );
            } catch (e) {
                throw new Error('Could not parse WMS capabilities');
            }
        }

        if (this.options.wms) {
            if (!responses[responses.length - 1].ok) {
                throw new Error('Request for WMS capabilties failed');
            }

            try {
                this.parseWMSCapabilities(
                    await responses[responses.length - 1].text(),
                );
            } catch (e) {
                throw new Error('Could not parse WMS capabilities');
            }
        }

        this.parsedCapabilities = true;
    }

    private parseWMSCapabilities(body: string) {
        const capabilities = new XMLService(body);

        if (this.isException(capabilities)) {
            throw new Error('Exception in remote WMS Server');
        }

        const layerNodes = capabilities.node(capabilities.document, './wms:WMS_Capabilities/wms:Capability/wms:Layer');

        for (let i = 0; i < layerNodes.snapshotLength; i++) {
            if (layerNodes.snapshotItem(i)) {
                this.parseWMSLayer(capabilities, layerNodes.snapshotItem(i) as Node);
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
                this.parseWMSLayer(capabilities, nestedLayers.snapshotItem(i) as Node);
            }
        }
    }

    private parseWFSCapabilities(body: string) {
        const capabilities = new XMLService(body);

        if (this.isException(capabilities)) {
            throw new Error('Exception in remote WMS Server');
        }

        const layerNodes = capabilities.node(capabilities.document, './wfs:WFS_Capabilities/wfs:FeatureTypeList/wfs:FeatureType');

        for (let i = 0; i < layerNodes.snapshotLength; i++) {
            if (layerNodes.snapshotItem(i)) {
                this.parseWFSLayer(capabilities, layerNodes.snapshotItem(i) as Node);
            }
        }
    }

    private parseWFSLayer(capabilities: XMLService, node: Node) {
        const name = capabilities.string(node, './wms:Name');

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

        if (exception.snapshotLength > 0) {
            return true;
        } else {
            return false;
        }
    }
}
