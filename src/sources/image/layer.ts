/*
Copyright 2018 Geoloep

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { ImageOverlay, LatLngBounds } from 'leaflet';

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
            const o = this.options;
            const southWest: [number, number] = [(o.yorigin / o.resolution) * -1, (o.xorigin / o.resolution) * -1];
            const northEast: [number, number] = [(o.height / o.resolution) + southWest[0], (o.width / o.resolution) + southWest[1]];

            this._bounds = new LatLngBounds(southWest, northEast);
        }

        return this._bounds;
    }

    get preview() {
        return `<p>imagelayer</p>`;
    }

    get leaflet() {
        if (!this._leaflet) {
            this._leaflet = new ImageOverlay(this.options.url, this.bounds);
        }

        return this._leaflet;
    }

    get legend() {
        return '<p>-</p>';
    }
}
