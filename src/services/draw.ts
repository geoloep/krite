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
        let originalOnTouch = L.Draw.Polyline.prototype._onTouch;
        L.Draw.Polyline.prototype._onTouch = function (this: any, e: any) {
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

    marker() {
        return this.draw<GeoJSON.Feature<GeoJSON.Point>>(new L.Draw.Marker(this.service.map, {}));
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
                        resolve(this.project.from((event.layer as L.Polygon).toGeoJSON()));
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
