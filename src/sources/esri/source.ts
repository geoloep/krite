import * as url from 'url';

import { IDataSource, ILayer } from '../../types';

import { ESRITiledMapLayer } from './tiledMapLayer';

export interface IESRIServiceListing {
    name: string;
    type: string;
    url?: string;
}

export interface IESRIServiceList {
    currentVersion: number;
    folders: any[];
    services: IESRIServiceListing[];
}

export class ESRISource implements IDataSource {
    capabilities: any;

    typeToLayer: { [index: string]: any } = {
        MapServer: ESRITiledMapLayer,
    };

    private layers: { [index: string]: ILayer } = {};
    private layerList: string[];

    constructor(readonly baseUrl: string) {
    }

    async getLayerNames() {
        if (!this.layerList) {
            await this.getCapabilities();
        }

        return this.layerList;
    }

    async getLayer(name: string): Promise<ILayer> {
        if (!this.layerList) {
            await this.getCapabilities();
        }

        if (this.layerList.indexOf(name) !== -1) {
            if (this.layers[name]) {
                return this.layers[name];
            } else {
                return this.createLayer(name);
            }
        } else {
            throw (new Error(`Requested layer ${name} does not exist`));
        }
    }

    private async getCapabilities() {
        const response = await fetch(
            this.baseUrl +
            url.format({
                query: {
                    f: 'pjson',
                },
            }),
        );

        if (!response.ok) {
            throw (new Error(`Request to ${response.url} failed`));
        }

        const json = await response.json();

        this.layerList = [];

        for (const layer of json.services) {
            if (layer.type in this.typeToLayer) {
                this.layerList.push(layer.name.split('/').pop());
            }
        }

        this.capabilities = json;
    }

    private async createLayer(name: string) {
        let layerUrl;
        let type;

        for (let i = 0; i < this.capabilities.services.length && !layerUrl; i++) {
            if (this.capabilities.services[i].name.split('/').pop() === name) {
                type = this.capabilities.services[i].type;
                layerUrl = this.baseUrl + name + '/' + type + '/';
            }
        }

        const response = await fetch(
            layerUrl + url.format({
                query: {
                    f: 'pjson',
                },
            }),
        );

        if (!response.ok) {
            throw (new Error(`Request to ${response.url} failed`));
        }

        const json = await response.json();

        const layer = new this.typeToLayer[type](layerUrl, json);

        this.layers[name] = layer;
        return layer;
    }
    // }

    // private loadLayerNames() {
    //     const layerNames: string[] = [];
    //     for (const service of this.services.services) {
    //         layerNames.push(service.name);
    //     }
    //     return (layerNames);
    // }



    // private async _getLayer(name: string): Promise<ILayer> {
    //     let service: IESRIServiceListing | undefined;

    //     for (const serviceItem of this.services.services) {
    //         if (serviceItem.name === name) {
    //             service = serviceItem;
    //         }
    //     }

    //     if (service) {
    //         const serviceUrl = `${this.baseUrl}/${name}/${service.type}/`;

    //         const response = await fetch(serviceUrl + url.format({
    //             query: {
    //                 f: 'pjson',
    //             },
    //         }),
    //         );

    //         if (!response.ok) {
    //             console.error('Malformed response');
    //         }

    //         const json = await response.json();

    //         this.layers[name] = new this.typeToLayer[service.type](serviceUrl, name, json, this);

    //         return this.layers[name];
    //     } else {
    //         throw ('Layer not found');
    //     }
    // }

    // private async getServices(): Promise<void> {
    //     const response = await fetch(
    //         this.baseUrl +
    //         url.format({
    //             query: {
    //                 f: 'pjson',
    //             },
    //         }),
    //     );

    //     if (!response.ok) {
    //         console.error('Malformed response');
    //     }

    //     this.services = await response.json();

    //     return;
    // }
}
