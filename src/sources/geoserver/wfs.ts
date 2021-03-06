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

import { GeoJSON } from 'leaflet';
import url from '../../util/url';
import * as wellknown from 'wellknown';

import { Krite } from '../../krite';
import { XMLService } from '../../services/xml';
import { ILayer } from '../../types';
import Evented from '../../util/evented';

/**
 * This layer implements a Web Feature Service interface
 *
 * Spatial operations depend on the availability of the cql_filter paramater!
 */
export class WFSLayer extends Evented implements ILayer {
    preview = '-';
    legend = '<p>-</p>';
    bounds: undefined;
    hasOnClick = true;
    hasOperations = true;

    private krite: Krite;

    private _title: string;
    private _name: string;
    private _abstract: string;
    private _leaflet: L.GeoJSON;
    private data: GeoJSON.FeatureCollection<GeoJSON.GeometryObject>;
    private geomField: string;
    private isPoint: boolean;
    private withinDistance = 5;

    private xml: XMLService;
    private types: XMLService;

    constructor(readonly url: string, readonly document: Node) {
        super();

        this.xml = new XMLService(document);
    }

    added(krite: Krite) {
        this.krite = krite;
    }

    get title(): string {
        if (!this._title) {
            this._title = this.xml.string(this.document, './wms:Title');
        }

        return this._title;
    }

    get name(): string {
        if (!this._name) {
            this._name = this.xml.string(this.document, './wms:Name');
        }

        return this._name;
    }

    get abstract() {
        if (!this._abstract) {
            this._abstract = this.xml.string(this.document, './wms:Abstract');
        }

        return this._abstract;
    }

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

        const response = await fetch(this.url + url.format({
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

    async intersectsPoint(point: L.Point) {
        const fieldname = await this.getGeomField();
        let cql_filter: string;

        // Points are impossible to click, use Within in stead. Withindistance has to become dynamic in the future, as does the unit...
        if (this.isPoint) {
            cql_filter = `DWITHIN(${fieldname}, POINT(${point.x} ${point.y}), ${this.withinDistance}, meters)`;
        } else {
            cql_filter = `INTERSECTS(${fieldname}, POINT(${point.x} ${point.y}))`;
        }

        const response = await fetch(this.url + url.format({
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

        const response = await fetch(this.url + url.format({
            query,
        }));

        if (!response.ok) {
            throw new Error(`Repsonse for ${response.url} not ok`);
        }

        return await response.json();
    }

    private async loadData() {
        const response = await fetch(this.url + url.format({
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

    /**
     * This function determines the fieldname of the geometry of the layer, it is needed for making spatial querys
     */
    private async getGeomField() {
        if (!this.geomField) {
            if (!this.types) {
                await this.describeFeatureType();
            }

            // Will always pick the first gml-node
            const gmlnode = this.types.node(this.types.document, '//xsd:element[starts-with(@type, \'gml\')][1]');

            if (gmlnode.snapshotLength > 0) {
                this.geomField = this.types.string(gmlnode.snapshotItem(0) as Node, './@name');

                this.isPoint = (this.types.string(gmlnode.snapshotItem(0) as Node, './@type').indexOf('Point') !== -1);
            } else {
                console.warn(`Trying default fieldname for the geometry field of ${this.title}`);
                this.geomField = 'geom';
            }
        }

        return this.geomField;
    }

    /**
     * This function performs a WFS Describefeature request for the relevant layer and saves the resulting document
     */
    private async describeFeatureType() {
        if (!this.types) {
            const response = await fetch(this.url +
                url.format({
                    query: {
                        request: 'DescribeFeatureType',
                        service: 'WFS',
                        typename: this.name,
                    },
                }));

            if (!response.ok) {
                throw new Error(`Response from ${response.url} not ok`);
            }

            this.types = new XMLService(await response.text());
        }

        return this.types;
    }
}
