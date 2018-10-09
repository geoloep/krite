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

import crs from 'leaflet-rd';
import { ICRS } from '../types';

import proj4 from 'proj4';
import * as reproject from 'reproject';
import { Point, LatLng } from 'leaflet';

const rdproj = crs.projection.proj4def;

export default class Rijksdriehoekstelsel implements ICRS {
    identifiers = {
        leaflet: 'EPSG:28992',
        krite: 'EPSG:28992',
    };

    crs = crs;

    geoTo(geojson: GeoJSON.GeoJSON): GeoJSON.GeoJSON {
        return reproject.toWgs84(geojson, rdproj);        
    }

    geoFrom(geojson: GeoJSON.GeoJSON) {
        return reproject.reproject(geojson, proj4.WGS84, rdproj);
    }

    pointTo(point: Point) {
        return crs.projection.unproject(point);
    }

    pointFrom(latLng: LatLng) {
        return crs.projection.project(latLng);
    }
}