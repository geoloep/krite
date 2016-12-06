import * as $ from 'jquery';
import { GeoserverLayer } from './layer';

import { IDataSource, ILayer } from '../../types';

// wms-capabilities heeft geen definitie 
let WMSCapabilities = require('wms-capabilities');

export interface IGeoServerSourceOptions {
    wfs?: boolean;
    wfsNamespace?: string;
    field?: string;
}

export class GeoServerSource implements IDataSource {
    capabilities: any | undefined = undefined;

    private layersLoaded: boolean = false;
    private layerNames: string[] = [];
    private layers: { [index: string]: ILayer } = {};


    constructor(readonly url: string, readonly options: IGeoServerSourceOptions = {}) {
    }

    getLayers() {
        return new Promise<{ [index: string]: ILayer }>(
            (resolve, reject) => {
                if (this.layersLoaded) {
                    resolve(this.layers);
                } else {
                    this.getCapabilities().then(
                        () => {
                            resolve(this.layers);
                        }
                    );
                }
            }
        );
    }

    getLayerNames() {
        return new Promise<string[]>(
            (resolve, reject) => {
                if (this.layersLoaded) {
                    resolve(this.layerNames);
                } else {
                    this.getCapabilities().then(
                        () => {
                            resolve(this.layerNames);
                        }
                    );
                }
            }
        );
    }

    getLayer(name: string) {
        return new Promise<ILayer>((resolve, reject) => {
            this.getLayers().then((layers) => {
                if (name in layers) {
                    resolve(layers[name]);
                }
            });
        });
    }

    private getCapabilities(): Promise<void> {
        return new Promise(
            (resolve, reject) => {
                $.ajax({
                    data: {
                        request: 'GetCapabilities',
                        service: 'WMS',
                    },
                    dataType: 'text',
                    url: this.url,
                }).done((data) => {
                    this.capabilities = new WMSCapabilities(data).toJSON();

                    for (let layer of this.capabilities.Capability.Layer.Layer) {
                        this.layerNames.push(layer.Name);
                        this.layers[layer.Name] = new GeoserverLayer(layer, this);
                    }

                    this.layersLoaded = true;
                    resolve();
                }).fail(function (e) {
                    // @todo: fail verwerken
                    reject();
                });
            }
        );
    }
}
