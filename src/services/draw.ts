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

import 'leaflet-draw';

import { Draw } from 'leaflet';
import { Krite } from '../krite';
import { MapService } from './map';
import { ProjectService } from './project';

export class DrawService {
    private lock = false;
    private drawFeature: Draw.Feature;

    private krite: Krite;

    constructor() {
        // Hack for preveting adding points during drag
        // https://github.com/Leaflet/Leaflet.draw/issues/695
        const originalOnTouch = (<any> Draw).Polyline.prototype._onTouch;
        (<any> Draw).Polyline.prototype._onTouch = function(this: any, e: any) {
            if (e.originalEvent.pointerType !== 'mouse') {
                return originalOnTouch.call(this, e);
            }
        };
    }

    async added(krite: Krite) {
        this.krite = krite;
    }

    disable() {
        if (this.drawFeature) {
            this.drawFeature.disable();
            this.lock = false;
        }
    }

    marker(icon?: L.Icon) {
        return this.draw<GeoJSON.Feature<GeoJSON.Point>>(new Draw.Marker(this.krite.map.leaflet, { icon }));
    }

    rectangle() {
        return this.draw<GeoJSON.Feature<GeoJSON.Polygon>>(new Draw.Rectangle(this.krite.map.leaflet, {}));
    }

    polyline() {
        return this.draw<GeoJSON.Feature<GeoJSON.LineString>>(new Draw.Polyline(this.krite.map.leaflet, {}));
    }

    polygon() {
        return this.draw<GeoJSON.Feature<GeoJSON.Polygon>>(new Draw.Polygon(this.krite.map.leaflet, {}));
    }

    private draw<T>(draw: Draw.Feature): Promise<T> {
        this.drawFeature = draw;

        return new Promise<T>((resolve, reject) => {
            if (this.krite.map) {
                if (!this.lock) {
                    this.lock = true;
                    draw.enable();

                    // Only seems to fire when valid geometry is created
                    this.krite.map.leaflet.once('draw:created', (event: L.LayerEvent) => {
                        resolve(this.krite.crs.geoFrom((event.layer as L.Polygon).toGeoJSON()));
                    });

                    // Release lock when draw actions have completed, even when valid geometry was not created
                    this.krite.map.leaflet.once('draw:drawstop', (event: L.LayerEvent) => {
                        this.lock = false;
                    });
                } else {
                    reject('Draw already in progress');
                }
            } else {
                reject('DrawService cannot be activated before MapService is present');
            }
        });
    }
}
