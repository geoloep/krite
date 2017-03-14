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
        return(layerNames);
    }

    async getLayer(name: string) {
        if (!this.services) {
            await this.getServices();
        }

        return await this._getLayer(name);
    }

    private async _getLayer(name: string) {
        if (this.services.services) {
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
                    })
                );

                if (!response.ok) {
                    console.error('Malformed response');
                }

                let json = await response.json();

                this.layers[name] = new this.typeToLayer[service.type](serviceUrl, json, this);

                return this.layers[name];
            } else {
                console.error('Layer not found');
            }
        } else {
            console.error('Services not loaded correctly');
        }


        // return new Promise<ILayer>((resolve, reject) => {
        //     for (let service of this.services.services) {
        //         if (service.name === name) {
        //             if (service.type in this.typeToLayer) {
        //                 // Soms is de naam service/laag, we moeten alleen 'laag' toevoegen aan de url
        //                 let urlName = name.split('/').pop();
        //                 let fullUrl = `${this.url}${urlName}/${service.type}/` //this.url + urlName + '/';

        //                 fetch(
        //                     fullUrl +
        //                     url.format({
        //                         query: {
        //                             f: 'pjson',
        //                         },
        //                     })
        //                 ).then((response) => {
        //                     if (response.ok) {
        //                         response.json().then((json) => {
        //                             this.layers[name] = new this.typeToLayer[service.type](fullUrl, json, this);
        //                             resolve(this.layers[name]);
        //                         }).catch(reject);
        //                     } else {
        //                         reject();
        //                     }
        //                 }).catch(reject);
        //             } else {
        //                 reject(`No implementation for ${service.type}`);
        //             }
        //         }
        //     }
        // });
    }

    private async getServices(): Promise<void> {
        let response = await fetch(
            this.url +
            url.format({
                query: {
                    f: 'pjson',
                },
            })
        );

        if (!response.ok) {
            console.error('Malformed response');
        }

        this.services = await response.json();


        return;
    }
}
