import { IDataSource, ILayer } from '../../types';

import * as url from 'url';
import { parseString } from 'xml2js';

import { WFSLayer } from './layer';

export class WFSSource implements IDataSource {
    capabilities: any;

    private layersLoaded = false;
    private layerNames: string[] = [];
    private layers: { [index: string]: ILayer } = {};

    constructor(readonly url: string) {

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
                                explicitArray: true,
                            },
                                (err, result) => {
                                    console.log(result);

                                    for (let featureType of result['wfs:WFS_Capabilities'].FeatureTypeList[0].FeatureType) {
                                        this.layerNames.push(featureType.Title[0]);
                                        this.layers[featureType.Title[0]] = new WFSLayer(featureType, this);
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