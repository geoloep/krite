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

        const layer = new this.typeToLayer[type](layerUrl, name, json);

        this.layers[name] = layer;
        return layer;
    }
}
