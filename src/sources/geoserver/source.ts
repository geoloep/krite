import * as url from 'url';
import { GeoserverLayer } from './layer';

import { IDataSource, ILayer } from '../../types';

// wms-capabilities heeft geen definitie 
let WMSCapabilities = require('wms-capabilities');
import { parseString } from 'xml2js';

export interface IGeoServerSourceOptions {
    wfs?: boolean;
    wfsNamespace?: string;
    field?: string;
}

export class GeoServerSource implements IDataSource {
    capabilities: any;
    wfscapabilities: any;

    private wfsFeature: { [index: string]: any } = {};
    private wfsFeatureTypes: { [index: string]: any } = {};
    private wfsFeatureToType: { [index: string]: any } = {};

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
        return new Promise<void>((resolve, reject) => {
            let getWMSCapabilities = fetch(
                this.url +
                url.format({
                    query: {
                        request: 'GetCapabilities',
                        service: 'WMS',
                    },
                }),
            );

            let getWFSCapabilities = fetch(
                this.url +
                url.format({
                    query: {
                        request: 'GetCapabilities',
                        service: 'WFS',
                    },
                }),
            );

            // Wacht op inladen van capabilities
            Promise.all([getWMSCapabilities, getWFSCapabilities]).then((response) => {
                for (let r of response) {
                    if (!(r.ok)) {
                        reject();
                    }
                }

                // Wacht op uitlezen antwoorden getCapabilities
                Promise.all([response[0].text(), response[1].text()]).then((data) => {
                    this.capabilities = new WMSCapabilities(data[0]).toJSON(); // @todo: eigen implementatie maken

                    // WFS uitlezen en status bepalen
                    let readWFS = new Promise<void>((res, rej) => {
                        parseString(data[1], {
                            async: true,
                            explicitArray: true,
                        }, (err, result) => {
                            if ('wfs:WFS_Capabilities' in result) {
                                // WFS is geactiveerd

                                for (let featureType of result['wfs:WFS_Capabilities'].FeatureTypeList[0].FeatureType) {
                                    this.wfsFeature[featureType.Title[0]] = featureType;
                                }

                                // Featuretypen beschrijven
                                fetch(this.url +
                                    url.format({
                                        query: {
                                            request: 'DescribeFeatureType',
                                            service: 'WFS',
                                        },
                                    })).then((desResponse) => {
                                        if (desResponse.ok) {
                                            desResponse.text().then((desData: any) => {

                                                parseString(desData, {
                                                    async: true,
                                                    explicitArray: true,
                                                }, (desErr, desResult) => {

                                                    for (let element of desResult['xsd:schema']['xsd:element']) {
                                                        // Een lijst aanmaken van welke FeatureType bij welke laag hoort
                                                        this.wfsFeatureToType[element.$.name] = element.$.type.split(':').pop();
                                                    }

                                                    for (let complexType of desResult['xsd:schema']['xsd:complexType']) {
                                                        let name = complexType.$.name;

                                                        // Een lijst aanmaken van de velden die bij een FeatureType horen
                                                        this.wfsFeatureTypes[name] = complexType['xsd:complexContent'][0]['xsd:extension'][0]['xsd:sequence'][0]['xsd:element'];
                                                    }

                                                    res();
                                                });

                                            }).catch(reject);
                                        } else {
                                            reject();
                                        }
                                    }).catch(reject);
                            } else {
                                res();
                            }
                        });
                    }).then(() => {

                        for (let layer of this.capabilities.Capability.Layer.Layer) {
                            this.layerNames.push(layer.Name);
                            this.layers[layer.Name] = new GeoserverLayer(layer, this.wfsFeature[layer.Title], this.wfsFeatureTypes[this.wfsFeatureToType[layer.Name]], this);

                            if (layer.Layer && layer.Layer.length) {
                                for (let l of layer.Layer) {
                                    this.layerNames.push(l.Name);
                                    this.layers[l.Name] = new GeoserverLayer(l, this.wfsFeature[l.Title], this.wfsFeatureTypes[this.wfsFeatureToType[l.Name]], this);

                                }
                            }
                        }

                        this.layersLoaded = true;

                        resolve();
                    });
                });

            }).catch(reject);

        });
    }
}
