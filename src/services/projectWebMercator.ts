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

import * as L from 'leaflet';
import { IProjectionService } from '../types';

/**
 * This projection service assumes the use of a Web Mercator projecction in leaflet and WGS/Latlng in krite and is
 * suitable for most projects
 */
export class ProjectWebMercatorService implements IProjectionService {
    identifiers = {
        leaflet: 'EPSG:3857',
        krite: 'EPSG:4326',
    };

    /**
     * Create a ProjectLatLngService instance
     * @param reverse Reverse latitude and longitude during projecting
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
            return L.point(latLng.lat, latLng.lng);
        } else {
            return this.project(latLng);
        }
    }

    project(latLng: L.LatLng) {
        return L.Projection.SphericalMercator.project(latLng);
    }

    unproject(point: L.Point) {
        return L.Projection.SphericalMercator.unproject(point);
    }
}
