import * as L from 'leaflet';

import { WMTSSource } from './source';

import { ILayer } from '../../types';

export class WMTSLayer implements ILayer {
    _leaflet: L.TileLayer;

    constructor(private capabilities: any, readonly source: WMTSSource) {
    }

    get title() {
        return this.capabilities.Title;
    }

    get name() {
        return this.capabilities.Identifier;
    }

    get abstract() {
        return this.capabilities.Title;
    }

    get bounds(): undefined {
        return undefined;
    }

    get preview() {
        return `<p>${this.capabilities.Title}</p>`;
    }

    get leaflet() {
        if (this._leaflet) {
            return this._leaflet;
        } else {
            this._leaflet = L.tileLayer(this.source.url + `?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${this.capabilities.Title}&TILEMATRIXSET=EPSG:28992&TILEMATRIX=EPSG:28992:{z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png`, {
                maxZoom: 16,
                minZoom: 3,
                maxNativeZoom: 14,
            });

            return this._leaflet;
        }
    }

    get legend() {
        return '<p>-</p>';
    }
}
