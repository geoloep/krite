import * as url from 'url';
import { WMTSLayer } from './layer';

import { IDataSource, ILayer } from '../../types';

import { parseString } from 'xml2js';
let processors = require('xml2js/lib/processors');

// export interface IGeoServerSourceOptions {
//     wfs?: boolean;
//     wfsNamespace?: string;
//     field?: string;
// }

export class WMTSSource implements IDataSource {
    capabilities: any | undefined = undefined;

    private layersLoaded: boolean = false;
    private layerNames: string[] = [];
    private layers: { [index: string]: ILayer } = {};


    constructor(readonly url: string, readonly options: any = {}) {
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

    private getCapabilities() {
        return new Promise(
            (resolve, reject) => {
                fetch(
                    this.url +
                    url.format({
                        query: {
                            request: 'GetCapabilities',
                        },
                    })
                ).then((response) => {
                    if (response.ok) {
                        response.text().then((data) => {
                            parseString(data, {
                                async: true,
                                explicitArray: false,
                                tagNameProcessors: [processors.stripPrefix],
                            },
                            (err, result) => {
                                this.capabilities = result;

                                for (let layer of this.capabilities.Capabilities.Contents.Layer) {
                                    this.layerNames.push(layer.Title);
                                    this.layers[layer.Title] = new WMTSLayer(layer, this);
                                }

                                this.layersLoaded = true;
                                resolve();
                            });
                        }).catch(reject);
                    } else {
                        reject();
                    }
                }).catch(reject);
            }
        );
    }
}
