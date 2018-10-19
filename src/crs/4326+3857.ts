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

import { CRS, Point, Projection } from 'leaflet';
import { ICRS } from '../types';

/**
 * This CRS sets the Web Mercator projection for tile layers and WGS84 LatLngs for vector data. This mirrors the default
 * Leaflet behavior and is suitable for most projects
 */
export default class WebMercator implements ICRS {
    identifiers = {
        leaflet: 'EPSG:3857',
        krite: 'EPSG:4326',
    };

    crs = CRS.EPSG3857;

    /**
     * Create a Web Mercator CRS Instance
     * @param reverse Reverse latitude and longitude during projection
     */
    constructor(readonly reverse: boolean = true) {
    }

    geoTo(geojson: GeoJSON.GeoJsonObject | GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.FeatureCollection<GeoJSON.GeometryObject> | GeoJSON.GeometryCollection) {
        return geojson;
    }

    geoFrom(geojson: GeoJSON.GeoJsonObject | GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.FeatureCollection<GeoJSON.GeometryObject> | GeoJSON.GeometryCollection) {
        return geojson;
    }

    pointTo(point: L.Point) {
        return this.unproject(point);
    }

    pointFrom(latLng: L.LatLng) {
        if (this.reverse) {
            return new Point(latLng.lat, latLng.lng);
        } else {
            return this.project(latLng);
        }
    }

    project(latLng: L.LatLng) {
        return Projection.SphericalMercator.project(latLng);
    }

    unproject(point: L.Point) {
        return Projection.SphericalMercator.unproject(point);
    }
}
