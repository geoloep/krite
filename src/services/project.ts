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

import { CRS } from 'leaflet';
import proj4 from 'proj4';
import * as reproject from 'reproject';
import { IProjectionService } from '../types';

/**
 * Reproject GeoJSON between map and krite crs
 */
export class ProjectService implements IProjectionService {
    identifiers = {
        leaflet: '',
        krite: '',
    };

    constructor(readonly crs: CRS, readonly def: string) {
        if (!crs.code) {
            throw new Error('Cannot use CRS without code property');
        }

        this.identifiers.leaflet = crs.code;
        this.identifiers.krite = crs.code;
    }

    /**
     * reproject from the krite crs to wgs84
     */
    geoTo(geojson: GeoJSON.GeoJsonObject | GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.FeatureCollection<GeoJSON.GeometryObject> | GeoJSON.GeometryCollection) {
        return reproject.toWgs84(geojson, this.def);
    }

    /**
     * reproject from wgs84 tot the krite crs
     */
    geoFrom(geojson: GeoJSON.GeoJsonObject | GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.FeatureCollection<GeoJSON.GeometryObject> | GeoJSON.GeometryCollection) {
        return reproject.reproject(geojson, proj4.WGS84, this.def);
    }

    pointTo(point: L.Point) {
        return this.unproject(point);
    }

    pointFrom(latLng: L.LatLng) {
        return this.project(latLng);
    }

    /**
     * Wrapper of the projection.project function
     * @param latLng LatLng as returned from leaflet
     */
    project(latLng: L.LatLng) {
        // @todo fix use of any
        return (<any> this.crs).projection.project(latLng);
    }

    /**
     * Wrapper of the projection.unproject function
     * @param point Coordinates in the krite crs
     */
    unproject(point: L.Point) {
        // @todo fix use of any
        return (<any> this.crs).projection.unproject(point);
    }
}
