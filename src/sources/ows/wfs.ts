import * as L from 'leaflet';
import * as wellknown from 'wellknown';
import * as url from 'url';

import { ILayer, ILayerClickHandler } from '../../types';
import { XMLService } from '../../services/xml';

import pool from '../../servicePool';
import { ProjectService } from '../../services/project';

let project = pool.getService<ProjectService>('ProjectService');

/**
 * This layer implements a Web Feature Service interface
 *
 * Spatial operations depend on the availability of the cql_filter paramater!
 */
export class WFSLayer implements ILayer {
    preview = '-';
    legend = '<p>-</p>';
    bounds: undefined;
    hasOnClick = true;
    hasOperations = true;

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

    private onClickCallbacks: ILayerClickHandler[] = [];

    constructor(readonly url: string, readonly document: Node) {
        this.xml = new XMLService(document);
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
            this._leaflet = L.geoJSON(undefined, {
                onEachFeature: (feature, layer) => {
                    layer.on('click', () => {
                        this.clickHandler(feature.properties);
                    });
                },
            });

            this.loadData();
        }

        return this._leaflet;
    }

    async intersects(feature: GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.GeometryObject) {
        let wkt = wellknown.stringify(<GeoJSON.GeoJsonObject>feature);

        let fieldname = await this.getGeomField();

        let response = await fetch(this.url + url.format({
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
            throw `Repsonse for ${response.url} not ok`;
        }

        return await response.json();
    }

    async intersectsPoint(point: L.Point) {
        let fieldname = await this.getGeomField();
        let cql_filter: string;

        // Points are impossible to click, use Within in stead. Withindistance has to become dynamic in the future, as does the unit...
        if (this.isPoint) {
            cql_filter = `DWITHIN(${fieldname}, POINT(${point.x} ${point.y}), ${this.withinDistance}, meters)`;
        } else {
            cql_filter = `INTERSECTS(${fieldname}, POINT(${point.x} ${point.y}))`;
        }

        let response = await fetch(this.url + url.format({
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
            throw `Repsonse for ${response.url} not ok`;
        }

        return await response.json();
    }

    async filter(filters: any) {
        let cql = '';

        for (let field in filters) {
            if (filters[field]) {
                if (cql.length > 0) {
                    cql += ' AND ';
                }

                cql += `${field} = `;

                if (typeof (filters[field]) === 'number') {
                    cql += filters[field];
                } else {
                    cql += `'${filters[field]}'`;
                }
            }
        }

        let response = await fetch(this.url + url.format({
            query: {
                cql_filter: cql,
                outputformat: 'application/json',
                request: 'GetFeature',
                service: 'WFS',
                typenames: this.name,
                version: '2.0.0',
            },
        }));

        if (!response.ok) {
            throw `Repsonse for ${response.url} not ok`;
        }

        return await response.json();
    }

    onClick(fun: ILayerClickHandler) {
        this.onClickCallbacks.push(fun);
    }

    private clickHandler(feature: any) {
        for (let callback of this.onClickCallbacks) {
            callback(this, feature);
        }
    };

    private async loadData() {
        let response = await fetch(this.url + url.format({
            query: {
                service: 'WFS',
                version: '2.0.0',
                request: 'GetFeature',
                typeName: this.name,
                outputFormat: 'application/json',
            },
        }));

        if (!response.ok) {
            throw `Repsonse of ${response.url} not ok`;
        }

        let json = await response.json();

        this._leaflet.addData(project.geoTo(json));
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
            let gmlnode = this.types.node(this.types.document, '//xsd:element[starts-with(@type, \'gml\')][1]');

            if (gmlnode.snapshotLength > 0) {
                this.geomField = this.types.string(gmlnode.snapshotItem(0), './@name');

                this.isPoint = (this.types.string(gmlnode.snapshotItem(0), './@type').indexOf('Point') !== -1);
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
            let response = await fetch(this.url +
                url.format({
                    query: {
                        request: 'DescribeFeatureType',
                        service: 'WFS',
                        typename: this.name,
                    },
                }));

            if (!response.ok) {
                throw `Repsone from ${response.url} not ok`;
            }

            this.types = new XMLService(await response.text());
        }

        return this.types;
    }
}
