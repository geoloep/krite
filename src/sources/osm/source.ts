import * as L from 'leaflet';

import { IDataSource, ILayer } from '../../types';

/**
 * This layer contains the well known openstreetmap
 */
export class OsmLayer implements ILayer {
    title = 'Openstreetmap';
    name = 'Openstreetmap';
    abstract = 'Welcome to OpenStreetMap, the project that creates and distributes free geographic data for the world.';
    bounds = new L.LatLngBounds(L.latLng(-180, 90), L.latLng(180, 90));
    preview = '<img src="http://tile.osm.org/0/0/0.png">';

    legend = '';

    private _layer: L.TileLayer;
    private _legend: string;

    get leaflet() {
        if (!this._layer) {
            this._layer = L.tileLayer('http://tile.osm.org/{z}/{x}/{y}.png');
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
