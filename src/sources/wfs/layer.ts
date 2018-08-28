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

// @todo check ES6 compatibility of leaflet-wfst
import * as L from 'leaflet';

if (!((window as any).L)) {
    (window as any).L = L;
}

import 'leaflet-wfst/dist/Leaflet-WFST.src.js';

import { Krite } from '../../krite';
import { MapService } from '../../services/map';

import { ILayer, IProjectionService } from '../../types';
import Evented from '../../util/evented';

/**
 * This layer is a wrapper around Leaflet-WFST http://flexberry.github.io/Leaflet-WFST/
 */
export class WFSLayer extends Evented implements ILayer {
    preview = '-';
    legend = '<p>-</p>';
    bounds: undefined;
    hasOnClick = true;
    hasOperations = true;

    abstract = 'WFSLayer';

    _leaflet: L.Layer;

    private mapService: MapService;
    private projectService: IProjectionService;

    constructor(readonly options: L.WFSOptions) {
        super();
    }

    added(krite: Krite) {
        this.mapService = krite.getService<MapService>('MapService');
        this.projectService = krite.getService<IProjectionService>('ProjectService');
    }

    get title() {
        return <string> this.options.typeName;
    }

    get name() {
        return <string> this.options.typeName;
    }

    get leaflet() {
        if (!this._leaflet) {
            this.createLayer();
        }

        return this._leaflet;
    }

    async intersects(feature: GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.GeometryObject) {
        const layer: any = L.geoJSON(this.projectService.geoTo(feature));

        // Filter againt the first feature in the GeoJSON feature group
        const filter = new L.Filter.Intersects().append(layer._layers[Object.keys(layer._layers)[0]], <string> this.options.geometryField, <L.CRS> this.mapService.leaflet.options.crs);

        const resultLayer: any = new L.WFS(Object.assign(this.options, {
            filter,
        }));

        await new Promise((resolve, reject) => {
            resultLayer.on('load', () => {
                resolve();
            });
            resultLayer.on('error', () => {
                reject();
            });
        });

        return this.projectService.geoFrom((resultLayer as any).toGeoJSON());
    }

    async intersectsPoint(point: L.Point) {
        // const layer = L.marker(this.mapService.leaflet.options.crs.unproject(point));
        const layer = L.marker(this.projectService.pointTo(point));

        const filter = new L.Filter.Intersects().append(layer, <string> this.options.geometryField, <L.CRS> this.mapService.leaflet.options.crs);

        const resultLayer: any = new L.WFS(Object.assign(this.options, {
            filter,
        }));

        await new Promise((resolve, reject) => {
            resultLayer.on('load', () => {
                resolve();
            });
            resultLayer.on('error', () => {
                reject();
            });
        });

        return this.projectService.geoFrom((resultLayer as any).toGeoJSON());
    }

    // @todo needs to update to the new filter spec
    async filter(filters: any) {
        const filter = new L.Filter.EQ();

        for (const field in filters) {
            if (filters[field]) {
                filter.append(field, filters[field]);
            }
        }

        const resultLayer: any = new L.WFS(Object.assign(this.options, {
            filter,
        }));

        await new Promise((resolve, reject) => {
            resultLayer.on('load', () => {
                resolve();
            });
            resultLayer.on('error', () => {
                reject();
            });
        });

        return this.projectService.geoFrom((resultLayer as any).toGeoJSON());
    }

    private createLayer() {
        this._leaflet = new L.WFS(this.options);

        this._leaflet.on('load', () => {

            (this._leaflet as any).eachLayer((layer: L.Layer) => {
                layer.on('click', () => {
                    this.emit('click', this, (<any> layer).toGeoJSON().properties);
                });
            });
        });
    }
}
