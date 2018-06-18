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

import * as L from 'leaflet';

import pool from '../servicePool';

import { MapService } from './map';
import { ProjectService } from './project';

export class DrawService {
    private service: MapService;
    private project: ProjectService;
    private lock = false;
    private drawFeature: L.Draw.Feature;

    constructor() {
        (async () => {
            this.project = await pool.promiseService<ProjectService>('ProjectService');
        })();
        (async () => {
            this.service = await pool.promiseService<MapService>('MapService');
        })();

        // Hack for preveting adding points during drag
        // https://github.com/Leaflet/Leaflet.draw/issues/695
        const originalOnTouch = L.Draw.Polyline.prototype._onTouch;
        L.Draw.Polyline.prototype._onTouch = function(this: any, e: any) {
            if (e.originalEvent.pointerType !== 'mouse') {
                return originalOnTouch.call(this, e);
            }
        };
    }

    disable() {
        if (this.drawFeature) {
            this.drawFeature.disable();
            this.lock = false;
        }
    }

    bindTo(map: MapService) {
        this.service = map;
    }

    marker(icon?: L.Icon) {
        return this.draw<GeoJSON.Feature<GeoJSON.Point>>(new L.Draw.Marker(this.service.map, { icon }));
    }

    rectangle() {
        return this.draw<GeoJSON.Feature<GeoJSON.Polygon>>(new L.Draw.Rectangle(this.service.map, {}));
    }

    polyline() {
        return this.draw<GeoJSON.Feature<GeoJSON.LineString>>(new L.Draw.Polyline(this.service.map, {}));
    }

    polygon() {
        return this.draw<GeoJSON.Feature<GeoJSON.Polygon>>(new L.Draw.Polygon(this.service.map, {}));
    }

    private draw<T>(draw: L.Draw.Feature): Promise<T> {
        this.drawFeature = draw;

        return new Promise<T>((resolve, reject) => {
            if (this.service && this.project) {
                if (!this.lock) {
                    this.lock = true;
                    draw.enable();

                    // Only seems to fire when valid geometry is created
                    this.service.map.once('draw:created', (event: L.LayerEvent) => {
                        resolve(this.project.geoFrom((event.layer as L.Polygon).toGeoJSON()));
                    });

                    // Release lock when draw actions have completed, even when valid geometry was not created
                    this.service.map.once('draw:drawstop', (event: L.LayerEvent) => {
                        this.lock = false;
                    });
                } else {
                    reject('Draw already in progress');
                }
            } else {
                reject('DrawService requires both MapService and ProjectService to be available');
            }
        });
    }
}
