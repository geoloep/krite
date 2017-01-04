import * as $ from 'jquery';
import * as url from 'url';

import { parseString } from 'xml2js';

import { AardbevingLayer } from './layer';
import { IDataSource, ILayer } from '../../types';

export class AardbevingenSource implements IDataSource {
    layer: AardbevingLayer;
    private capabilities: Document;

    constructor() {
    }

    getLayers() {
        return new Promise<{ [index: string]: ILayer }>(
            (resolve, reject) => {
                if (this.layer) {
                    return {
                        'Actueel Weer': this.layer,
                    };
                } else {
                    this.getLayer('Recente aardbevingen')
                        .then((layer) => {
                            return {
                                'Recente aardbevingen': this.layer,
                            };
                        })
                        .catch(() => {
                            reject();
                        });
                }
            }
        );
    }

    getLayerNames() {
        return new Promise<string[]>(
            (resolve, reject) => {

                resolve(['Recente aardbevingen']);
            }
        );
    }

    getLayer(name: string) {
        return new Promise<ILayer>((resolve, reject) => {
            if (this.layer) {
                resolve(this.layer);
            } else {
                this.makeLayer()
                    .then((layer) => {
                        resolve(layer);
                    })
                    .catch(() => {
                        reject();
                    });
            }
        });
    }

    private makeLayer() {
        return new Promise<AardbevingLayer>(
            (resolve, reject) => {
                fetch('http://service.geoloep.nl/proxy/aardbevingen/GQuake_KNMI_RSS.xml').then((response) => {
                    if (response.ok) {
                        response.text().then((data) => {
                            parseString(data, {
                                async: true,
                                explicitArray: false,
                            },
                            (err, result) => {
                                this.capabilities = result;
                                this.layer = new AardbevingLayer(result);
                                resolve(this.layer);
                            });
                        }).catch(reject);
                    } else {
                        reject();
                    }
                }).catch(reject);
            });
    }
}
