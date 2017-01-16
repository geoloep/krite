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

    getLayer(name: string) {
        return new Promise<ILayer>((resolve, reject) => {
            for (let service of this.services.services) {
                if (service.name === name) {
                    if (service.type in this.typeToLayer) {
                        // Soms is de naam service/laag, we moeten alleen 'laag' toevoegen aan de url
                        let urlName = name.split('/').pop();
                        let fullUrl = `${this.url}${urlName}/${service.type}/` //this.url + urlName + '/';

                        fetch(
                            fullUrl +
                            url.format({
                                query: {
                                    f: 'pjson',
                                },
                            })
                        ).then((response) => {
                            if (response.ok) {
                                response.json().then((json) => {
                                    this.layers[name] = new this.typeToLayer[service.type](fullUrl, json, this);
                                    resolve(this.layers[name]);
                                }).catch(reject);
                            } else {
                                reject();
                            }
                        }).catch(reject);
                    } else {
                        reject(`No implementation for ${service.type}`);
                    }
                }
            }
        });
    }

    private getServices(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fetch(
                this.url +
                url.format({
                    query: {
                        f: 'pjson',
                    },
                })
            ).then((response) => {
                if (response.ok) {
                    response.json().then((json) => {
                        this.services = json;
                        resolve();
                    }).catch(reject);
                } else {
                    reject('Fout bij inlezen antwoord server');
                }
            }).catch(reject);
        });
    }
}