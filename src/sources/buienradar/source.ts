import * as $ from 'jquery';
import { parseString } from 'xml2js';

import { BuienradarLayer } from './layer';
import { IDataSource, ILayer } from '../../types';

export class BuienradarSource implements IDataSource {
    layer: BuienradarLayer;
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
                    this.getLayer('Actueel weer')
                        .then((layer) => {
                            return {
                                'Actueel Weer': this.layer,
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

                resolve(['Actueel weer']);
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
        return new Promise<BuienradarLayer>(
            (resolve, reject) => {
                $.ajax({
                    url: 'http://xml.buienradar.nl/',
                    dataType: 'text',
                }).done((data) => {
                    parseString(data,
                    {
                        async: true,
                        explicitArray: false,
                    },
                    (err, result) => {
                        this.capabilities = result;
                        this.layer = new BuienradarLayer(result);
                        resolve(this.layer)
                    });
                }).fail((err) => {
                    reject();
                });
            });
    }
}
