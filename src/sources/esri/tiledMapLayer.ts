import * as esri from 'esri-leaflet';

import { ILayer } from '../../types';
import { ESRISource } from './source';

import pool from '../../servicePool';
import { MapService } from '../../services/map';

const map = pool.getService<MapService>('MapService');

export class ESRITiledMapLayer implements ILayer {
    previewSet = 0;
    previewCol = 0;
    previewRow = 0;

    hasOperations = true;

    private _leaflet: any;

    constructor(readonly url: string, readonly capabilities: any) {
    }

    get title() {
        return this.capabilities.documentInfo.Title;
    }

    get name() {
        return this.capabilities.documentInfo.Title;
    }

    get abstract() {
        return this.capabilities.description;
    }

    get bounds(): undefined {
        return undefined;
    }

    get preview() {
        return `<img src="${this.url}tile/${this.previewSet}/${this.previewCol}/${this.previewSet}">`;
    }

    get leaflet() {
        if (this._leaflet) {
            return this._leaflet;
        } else {
            this._leaflet = esri.tiledMapLayer({
                url: this.url,
            });
            return this._leaflet;
        }
    }

    get legend() {
        return ``;
    }

    async intersectsPoint?(point: L.Point) {
        const features = await new Promise((resolve, reject) => {
            this._leaflet.identify().on(map.map).at([point.x, point.y]).layers('top').run((error: boolean, features: any) => {
                resolve(features);
            });
        });

        return features;
    }
}
