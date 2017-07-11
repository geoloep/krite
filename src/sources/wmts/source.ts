import * as url from 'url';
import { WMTSLayer } from './layer';

import { IDataSource, ILayer } from '../../types';

import { XMLService } from '../../services/xml';

export class WMTSSource implements IDataSource {
    capabilities: any | undefined = undefined;

    private layersLoaded: boolean = false;
    private layerNames: string[] = [];
    private layers: { [index: string]: ILayer } = {};

    constructor(readonly url: string, readonly options: any = {}) {
    }

    async getLayerNames() {
        if (!this.layersLoaded) {
            await this.getCapabilities();
        }

        return this.layerNames;
    }

    async getLayer(name: string) {
        if (!this.layersLoaded) {
            await this.getCapabilities();
        }

        if (!this.layers[name]) {
            console.error(`Layer ${name} not available`);
        }

        return this.layers[name];
    }

    private async getCapabilities() {
        let response = await fetch(this.url + url.format({
            query: {
                request: 'GetCapabilities',
            },
        }));

        if (!response.ok) {
            console.error('Malformed response');
        }

        let data = await response.text();

        await this.parseCapabilities(data);

        return;
    }

    private async parseCapabilities(data: any) {
        let response = await fetch(
            this.url +
            url.format({
                query: {
                    request: 'GetCapabilities',
                },
            }),
        );

        if (!response.ok) {
            throw `Response to ${response.url} not ok`;
        }

        let capabilities = this.capabilities = new XMLService(await response.text());

        let layers = capabilities.node(capabilities.document, './wmts:Capabilities/wmts:Contents/wmts:Layer');

        for (let i = 0; i < layers.snapshotLength; i++) {
            let layer = layers.snapshotItem(i);

            let title = capabilities.string(layer, './ows:Title');

            this.layerNames.push(title);

            this.layers[title] = new WMTSLayer(this.url, layer);
        }

        // return new Promise<void>((resolve, reject) => {
        //     parseString(data, {
        //         async: true,
        //         explicitArray: false,
        //         tagNameProcessors: [processors.stripPrefix],
        //     }, (err, result) => {
        //         if (err) {
        //             console.error('Xml parse error');
        //             reject();
        //         }

        //         this.capabilities = result;

        //         for (let layer of this.capabilities.Capabilities.Contents.Layer) {
        //             this.layerNames.push(layer.Title);
        //             this.layers[layer.Title] = new WMTSLayer(layer, this);
        //         }

        //         this.layersLoaded = true;

        //         resolve();
        //     });
        // });
    }

    private _getCapabilities() {
    //     return new Promise(
    //         (resolve, reject) => {
    //             fetch(
    //                 this.url +
    //                 url.format({
    //                     query: {
    //                         request: 'GetCapabilities',
    //                     },
    //                 })
    //             ).then((response) => {
    //                 if (response.ok) {
    //                     response.text().then((data) => {
    //                         parseString(data, {
    //                             async: true,
    //                             explicitArray: false,
    //                             tagNameProcessors: [processors.stripPrefix],
    //                         },
    //                             (err, result) => {
    //                                 this.capabilities = result;

    //                                 for (let layer of this.capabilities.Capabilities.Contents.Layer) {
    //                                     this.layerNames.push(layer.Title);
    //                                     this.layers[layer.Title] = new WMTSLayer(layer, this);
    //                                 }

    //                                 this.layersLoaded = true;
    //                                 resolve();
    //                             });
    //                     }).catch(reject);
    //                 } else {
    //                     reject();
    //                 }
    //             }).catch(reject);
    //         }
    //     );
    }
}
