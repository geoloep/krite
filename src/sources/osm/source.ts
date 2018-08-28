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

import { LatLng, LatLngBounds, TileLayer } from 'leaflet';

import { IDataSource, ILayer } from '../../types';

/**
 * This layer contains the well known openstreetmap
 */
export class OsmLayer implements ILayer {
    title = 'Openstreetmap';
    name = 'Openstreetmap';
    abstract = 'Welcome to OpenStreetMap, the project that creates and distributes free geographic data for the world.';
    bounds = new LatLngBounds(new LatLng(-180, 90), new LatLng(180, 90));
    preview = '<img src="http://tile.osm.org/0/0/0.png">';

    legend = '';

    private _layer: L.TileLayer;
    private _legend: string;

    get leaflet() {
        if (!this._layer) {
            this._layer = new TileLayer('http://tile.osm.org/{z}/{x}/{y}.png');
        }

        return this._layer;
    }
}

/**
 * This source exposes the regular openstreetmap tiles
 */
export class OsmSource implements IDataSource {
    private instance: OsmLayer;

    async getLayerNames() {
        return ['Openstreetmap'];
    }

    async getLayer(name: string) {
        if (!this.instance) {
            this.instance = new OsmLayer();
        }

        return this.instance;
    }
}
