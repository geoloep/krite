/*
Copyright 2022 Geoloep

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

import {GeoJSON, Point} from 'leaflet';
import url from '../../util/url';
import * as wellknown from 'wellknown';
import {WFSLayer} from "../ows/wfs";

/**
 * This layer implements a Web Feature Service interface
 *
 * Spatial operations depend on the availability of the cql_filter paramater!
 */
export class GeoserverWFSLayer extends WFSLayer{
    hasOnClick = true;

    private _leaflet: L.GeoJSON;
    private data: GeoJSON.FeatureCollection<GeoJSON.GeometryObject>;

    get leaflet() {
        if (!this._leaflet) {
            this._leaflet = new GeoJSON(undefined, {
                onEachFeature: (feature, layer) => {
                    layer.on('click', () => {
                        this.emit('click', this, feature.properties);
                    });
                },
            });

            this.loadData();
        }

        return this._leaflet;
    }

    async intersects(feature: GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.GeometryObject) {
        const wkt = wellknown.stringify(<GeoJSON.GeoJsonObject>feature);

        const fieldname = await this.getGeomField();

        const response = await fetch(this.baseUrl + url.format({
            query: {
                cql_filter: `INTERSECTS(${fieldname}, ${wkt})`,
                outputformat: 'application/json',
                request: 'GetFeature',
                service: 'WFS',
                typenames: this.name,
                version: '2.0.0',
            },
        }));

        if (!response.ok) {
            throw new Error(`Repsonse for ${response.url} not ok`);
        }

        return await response.json();
    }

    async intersectsPoint(point: Point) {
        const fieldname = await this.getGeomField();
        let cql_filter: string;

        // Points are impossible to click, use Within in stead. Withindistance has to become dynamic in the future, as does the unit...
        if (this.isPoint) {
            cql_filter = `DWITHIN(${fieldname}, POINT(${point.x} ${point.y}), ${this.withinDistance}, meters)`;
        } else {
            cql_filter = `INTERSECTS(${fieldname}, POINT(${point.x} ${point.y}))`;
        }

        const response = await fetch(this.baseUrl + url.format({
            query: {
                cql_filter,
                outputformat: 'application/json',
                request: 'GetFeature',
                service: 'WFS',
                typenames: this.name,
                version: '2.0.0',
            },
        }));

        if (!response.ok) {
            throw new Error(`Repsonse for ${response.url} not ok`);
        }

        return await response.json();
    }

    async filter(options: {
        id?: string,
        filters?: { [index: string]: string | null | number },
        properties?: string[],
    }) {

        const query: any = {
            outputformat: 'application/json',
            request: 'GetFeature',
            service: 'WFS',
            typenames: this.name,
            version: '2.0.0',
        };

        if (options.id) {
            query.featureID = options.id;
        }

        if (options.filters) {
            query.cql_filter = Object.entries(options.filters).map(([key, value]) => {
                if (value === null) {
                    return `${key} IS NULL`;
                } else if (typeof value === 'number') {
                    return `${key} = ${value}`;
                } else {
                    return `${key} = '${value}'`;
                }
            }).join(' AND ');
        }

        if (options.properties) {
            query.propertyName = '';

            for (const property of options.properties) {
                query.propertyName += property + ',';
            }
        }

        const response = await fetch(this.baseUrl + url.format({
            query,
        }));

        if (!response.ok) {
            throw new Error(`Repsonse for ${response.url} not ok`);
        }

        return await response.json();
    }

    private async loadData() {
        const response = await fetch(this.baseUrl + url.format({
            query: {
                service: 'WFS',
                version: '2.0.0',
                request: 'GetFeature',
                typeName: this.name,
                outputFormat: 'application/json',
            },
        }));

        if (!response.ok) {
            throw new Error(`Repsonse of ${response.url} not ok`);
        }

        const json = await response.json();

        this._leaflet.addData(this.krite.crs.geoTo(json));
    }
}
