/*
Copyright 2017 Geoloep

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

import * as esri from 'esri-leaflet';

import { ILayer } from '../../types';
import { ESRISource } from './source';

import pool from '../../servicePool';
import { MapService } from '../../services/map';

export class ESRITiledMapLayer implements ILayer {
    previewSet = 0;
    previewCol = 0;
    previewRow = 0;

    hasOperations = true;

    private _leaflet: any;
    private mapService = pool.tryService<MapService>('MapService');

    constructor(readonly url: string, readonly name: string, readonly capabilities: any) {
    }

    get title() {
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

    async intersectsPoint(point: L.Point) {
        if (this.mapService) {
            const features = await new Promise<GeoJSON.FeatureCollection<GeoJSON.GeometryObject>>((resolve, reject) => {
                this._leaflet.identify().on((this.mapService as MapService).map).at([point.x, point.y]).layers('top').run((error: boolean, ft: GeoJSON.FeatureCollection<GeoJSON.GeometryObject>) => {
                    resolve(ft);
                });
            });

            return features;
        } else {
            throw new Error(`Spatial operations on esri tile map layers requires the availabity of the MapService`);
        }
    }
}
