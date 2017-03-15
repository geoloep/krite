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
                service: 'WFS',
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

    private parseCapabilities(data: any) {
        return new Promise<void>((resolve, reject) => {
            parseString(data, {
                async: true,
                explicitArray: true,
            }, (err, result) => {
                if (err) {
                    console.error('Xml parse error');
                    reject();
                }

                for (let featureType of result['wfs:WFS_Capabilities'].FeatureTypeList[0].FeatureType) {
                    this.layerNames.push(featureType.Title[0]);
                    this.layers[featureType.Title[0]] = new WFSLayer(featureType, this);
                }

                this.layersLoaded = true;

                resolve();
            });
        });
    }
}
