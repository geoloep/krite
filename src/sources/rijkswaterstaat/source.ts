import * as $ from 'jquery';

import { WindsnelheidLayer } from './windsnelheid'
import { WindrichtingLayer } from './windrichting'
import { IDataSource, ILayer } from '../../types';

export class RijkswaterstaatSource implements IDataSource {
    private capabilities: any;
    private layers: { [index: string]: ILayer } = {};
    private layerNames = [
        'Actuele Windsnelheid',
        'Actuele Windrichting',
    ];
    private nameToType: { [index: string]: any } = {
        'Actuele Windsnelheid': WindsnelheidLayer,
        'Actuele Windrichting': WindrichtingLayer,
    };

    constructor() {
    }

    getLayers() {
        return new Promise<{ [index: string]: ILayer }>(
            (resolve, reject) => {
                if (this.capabilities) {
                    return this.layers;
                } else {
                    this.makeLayers()
                        .then((layers) => {
                            return layers;
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

                resolve(this.layerNames);
            }
        );
    }

    getLayer(name: string) {
        return new Promise<ILayer>((resolve, reject) => {
            if (this.layers[name]) {
                resolve(this.layers[name]);
            } else {
                this.makeLayers()
                    .then((layers) => {
                        resolve(layers[name]);
                    })
                    .catch(() => {
                        reject();
                    });
            }
        });
    }

    private makeLayers() {
        return new Promise<{ [index: string]: ILayer }>(
            (resolve, reject) => {
                $.ajax({
                    url: 'http://service.geoloep.nl/proxy/rijkswaterstaat/rwsnl/?mode=features&projecttype=windsnelheden_en_windstoten',
                    dataType: 'json',
                }).done((data) => {
                    this.capabilities = data;
                    for (let layerName of this.layerNames) {
                        this.layers[layerName] = new this.nameToType[layerName](this.capabilities);
                    }

                    resolve(this.layers);
                }).fail((err) => {
                    console.error(err);
                });
            });
    }
}
