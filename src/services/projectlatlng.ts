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

import { LatLng, Point, Projection } from 'leaflet';
import { IProjectionService } from '../types';

/**
 * This service simply passes the input geometries without any reprojection
 */
export class ProjectLatLngService implements IProjectionService {
    identifiers = {
        leaflet: 'EPSG:4326',
        krite: 'EPSG:4326',
    };

    geoTo(geojson: GeoJSON.GeoJsonObject | GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.FeatureCollection<GeoJSON.GeometryObject> | GeoJSON.GeometryCollection) {
        return geojson;
    }

    geoFrom(geojson: GeoJSON.GeoJsonObject | GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.FeatureCollection<GeoJSON.GeometryObject> | GeoJSON.GeometryCollection) {
        return geojson;
    }

    pointTo(point: Point) {
        return this.unproject(point);
    }

    pointFrom(latLng: LatLng) {
        return this.project(latLng);
    }

    project(latLng: LatLng) {
        return Projection.LonLat.project(latLng);
    }

    unproject(point: Point) {
        return Projection.LonLat.unproject(point);
    }
}
