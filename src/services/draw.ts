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

import { Draw, DrawOptions, FeatureGroup, Marker, Polyline, Polygon, EditToolbar, LayerEvent, ToolbarOptions, EditOptions } from 'leaflet';
import { Krite } from '../krite';

export class DrawService {
    private lock = false;
    private drawFeature: Draw.Feature | null;

    private krite: Krite;

    constructor() {
        // Hack for preventing adding points during drag
        // https://github.com/Leaflet/Leaflet.draw/issues/695
        const originalOnTouch = (<any>Draw).Polyline.prototype._onTouch;
        (<any>Draw).Polyline.prototype._onTouch = function (this: any, e: any) {
            if (e.originalEvent.pointerType !== 'mouse') {
                return originalOnTouch.call(this, e);
            }
        };
    }

    async added(krite: Krite) {
        this.krite = krite;
    }

    save() {
        if (this.drawFeature && (this.drawFeature as any).save) {
            (this.drawFeature as any).save()
            this.drawFeature.disable();
            this.lock = false;
        }
    }

    disable() {
        if (this.drawFeature) {
            this.drawFeature.disable();
            this.lock = false;
        }
    }

    marker(options?: DrawOptions.MarkerOptions) {
        return this.draw<GeoJSON.Feature<GeoJSON.Point>>(new Draw.Marker(this.krite.map.leaflet, options));
    }

    rectangle(options?: DrawOptions.RectangleOptions) {
        return this.draw<GeoJSON.Feature<GeoJSON.Polygon>>(new Draw.Rectangle(this.krite.map.leaflet, options));
    }

    polyline(options?: DrawOptions.PolylineOptions) {
        return this.draw<GeoJSON.Feature<GeoJSON.LineString>>(new Draw.Polyline(this.krite.map.leaflet, options));
    }

    polygon(options?: DrawOptions.PolygonOptions) {
        return this.draw<GeoJSON.Feature<GeoJSON.Polygon>>(new Draw.Polygon(this.krite.map.leaflet, options));
    }

    /**
     * Edit a feature on the map
     * @param feature Cannot be MultiGeometry
     */
    edit(feature: GeoJSON.Feature<GeoJSON.Geometry> | GeoJSON.Geometry, options?: any) {
        if (this.lock) {
            throw new Error('Draw already in progress');
        }

        return new Promise<GeoJSON.Feature | null>((resolve, reject) => {
            this.lock = true;

            const editGroup = new FeatureGroup([this.GeoJSONToLayer(feature)]).addTo(this.krite.map.leaflet);

            // @todo fix types, 
            // should reflect http://leaflet.github.io/Leaflet.draw/docs/leaflet-draw-latest.html#editpolyoptions
            const edit: any = new EditToolbar.Edit(this.krite.map.leaflet, {
                ...options,
                featureGroup: editGroup,
            } as any);

            this.drawFeature = edit;
            edit.enable();

            this.krite.map.leaflet.once('draw:edited', (event: any) => {
                resolve(this.krite.crs.geoFrom(((editGroup.getLayers()[0] as Polygon).toGeoJSON())));
            });

            this.krite.map.leaflet.once('draw:editstop', () => {
                editGroup.removeFrom(this.krite.map.leaflet);

                this.drawFeature = null;
                this.lock = false;

                resolve(null);
            });
        });
    }

    private draw<T>(draw: Draw.Feature): Promise<T | null> {
        this.drawFeature = draw;

        return new Promise<T | null>((resolve, reject) => {
            if (this.krite.map) {
                if (!this.lock) {
                    this.lock = true;
                    draw.enable();

                    // Only seems to fire when valid geometry is created
                    this.krite.map.leaflet.once('draw:created', (event: any) => {
                        resolve(this.krite.crs.geoFrom((event.layer as L.Polygon).toGeoJSON()));
                    });

                    // Release lock when draw actions have completed, even when valid geometry was not created
                    this.krite.map.leaflet.once('draw:drawstop', (event: any) => {
                        this.lock = false;
                        this.drawFeature = null;
                        resolve(null);
                    });
                } else {
                    reject('Draw already in progress');
                }
            } else {
                reject('DrawService cannot be activated before MapService is present');
            }
        });
    }

    /**
     * Convert GeoJSON to a Leaflet layer
     * @param feature
     */
    private GeoJSONToLayer(feature: GeoJSON.Feature<GeoJSON.Geometry> | GeoJSON.Geometry) {
        let geometry: GeoJSON.Geometry;

        if (feature.type === 'Feature') {
            geometry = feature.geometry;
        } else {
            geometry = feature;
        }

        const reprojected: GeoJSON.Geometry = this.krite.crs.geoTo(geometry);

        if (reprojected.type.slice(0, 5) === 'Multi') {
            throw new Error('Editing of MultiGeometries is not supported');
        }

        switch (reprojected.type) {
            case 'Point':
                return new Marker(reprojected.coordinates.reverse() as [number, number]);
            case 'LineString':
                return new Polyline(reprojected.coordinates.map((coordinate) => {
                    return coordinate.reverse() as [number, number];
                }));
            case 'Polygon':
                return new Polygon(reprojected.coordinates.map((ring) => {
                    return ring.map((coordinate) => {
                        return coordinate.reverse() as [number, number];
                    })
                }));
            default:
                throw new Error('Input feature is nog of a known type');
        }
    }
}
