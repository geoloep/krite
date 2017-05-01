import * as L from 'leaflet';

import { ILayer } from '../../types';

export interface ImageLayerOptions {
    url: string;
    resolution: number;
    width: number;
    height: number;
    xorigin: number;
    yorigin: number;
}

export class ImageLayer implements ILayer {
    _leaflet: L.ImageOverlay;
    _bounds: L.LatLngBounds;

    constructor(readonly options: ImageLayerOptions) {
    }

    get title() {
        return 'imagelayer';
    }

    get name() {
        return 'imagelayer';
    }

    get abstract() {
        return 'imagelayer';
    }

    get bounds() {
        if (!this._bounds) {
            let o = this.options;
            let southWest: [number, number] = [(o.yorigin / o.resolution) * -1, (o.xorigin / o.resolution) * -1];
            let northEast: [number, number] = [(o.height / o.resolution) + southWest[0], (o.width / o.resolution) + southWest[1]];

            this._bounds = L.latLngBounds(southWest, northEast);
        }

        return this._bounds;
    }

    get preview() {
        return `<p>imagelayer</p>`;
    }

    get leaflet() {
        if (!this._leaflet) {
            this._leaflet = L.imageOverlay(this.options.url, this.bounds);
        }

        return this._leaflet;
    }

    get legend() {
        return '<p>-</p>';
    }
}