import * as esri from 'esri-leaflet';

import { ILayer } from '../../types';
import { ESRISource } from './source';

export class ESRITiledMapLayer implements ILayer {
    _leaflet: L.Layer;

    constructor(readonly url: string, readonly _name: string, readonly capabilities: any, readonly source: ESRISource) {
    };

    get title() {
        return this.capabilities.mapName;
    };

    get name() {
        return this._name;
    };

    get abstract() {
        return this.capabilities.abstract;
    };

    get bounds(): undefined {
        return undefined;
    };

    get preview() {
        return '';
    };

    get leaflet() {
        if (this._leaflet) {
            return this._leaflet;
        } else {
            this._leaflet = esri.tiledMapLayer({
                url: this.url,
            });
            return this._leaflet;
        }
    };

    get legend() {
        return `<p>${this.capabilities.mapName}</p>`;
    };
}
