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
    services: IESRIServiceList;

    typeToLayer: { [index: string]: any } = {
        MapServer: ESRITiledMapLayer,
    };

    private layers: { [index: string]: ILayer } = {};

    constructor(readonly url: string) {
    }

    getLayers() {
        return new Promise<{ [index: string]: ILayer }>((resolve, reject) => {
            reject('Not implemented');
        });
    }

    getLayerNames() {
        return new Promise<string[]>((resolve, reject) => {
            if (this.services) {
                resolve(this._getLayerNames());
            } else {
                this.getServices().then(() => {
                    resolve(this._getLayerNames());
                });
            }
        });
    }

    _getLayerNames() {
        let layerNames: string[] = [];
        for (let service of this.services.services) {
            layerNames.push(service.name);
        }
        return (layerNames);
    }

    async getLayer(name: string): Promise<ILayer> {
        if (!this.services) {
            await this.getServices();
        }

        return await this._getLayer(name);
    }

    private async _getLayer(name: string): Promise<ILayer> {
        let service: IESRIServiceListing | undefined = undefined;

        for (let serviceItem of this.services.services) {
            if (serviceItem.name === name) {
                service = serviceItem;
            }
        }

        if (service) {
            let serviceUrl = `${this.url}/${name}/${service.type}/`;

            let response = await fetch(serviceUrl + url.format({
                query: {
                    f: 'pjson',
                },
            }),
            );

            if (!response.ok) {
                console.error('Malformed response');
            }

            let json = await response.json();

            this.layers[name] = new this.typeToLayer[service.type](serviceUrl, name, json, this);

            return this.layers[name];
        } else {
            throw('Layer not found');
        }
    }

    private async getServices(): Promise<void> {
        let response = await fetch(
            this.url +
            url.format({
                query: {
                    f: 'pjson',
                },
            }),
        );

        if (!response.ok) {
            console.error('Malformed response');
        }

        this.services = await response.json();

        return;
    }
}
