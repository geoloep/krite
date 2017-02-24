import * as L from 'leaflet';
import * as wellknown from 'wellknown';
import * as url from 'url';

import { GeoServerSource } from './source';

import { ILayer } from '../../types';

export class GeoserverLayer implements ILayer {
    _leaflet: L.WMS;
    _geomField: string;
    private _isPoint: boolean;
    private _withinDistance = 5;

    constructor(readonly capabilities: any, readonly wfscapabilities: any, readonly type: any, readonly source: GeoServerSource) {
    };

    // @todo: samenvoegen met hasOperations
    get canGetInfoAtPoint() {
        return Boolean(this.wfscapabilities);
    }

    get hasOperations() {
        return Boolean(this.wfscapabilities);
    }

    get hasOnClick() {
        return false;
    }

    get title() {
        return this.capabilities.Title;
    };

    get name() {
        return this.capabilities.Name;
    }

    get abstract() {
        return this.capabilities.Abstract;
    };

    get bounds(): undefined {
        return undefined;
    }

    get boundingBox() {
        let crs = 'EPSG:28992' // @todo: selecteerbaar maken?
        let bbox: number[] = [];

        for (let boundingBox of this.capabilities.BoundingBox) {
            if (boundingBox.crs === 'EPSG:28992') {
                for (let point of boundingBox.extent) {
                    bbox.push(point);
                }
            }
        }

        return bbox;
    };

    intersects(feature: GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.GeometryObject) {
        return new Promise<any>((resolve, reject) => {
            let wkt = wellknown.stringify(feature as GeoJSON.GeometryObject);

            fetch(this.source.url + url.format({
                query: {
                    cql_filter: `INTERSECTS(${this.geomField}, ${wkt})`,
                    outputformat: 'application/json',
                    request: 'GetFeature',
                    service: 'WFS',
                    typenames: this.typename,
                    version: '2.0.0',
                },
            })).then((response) => {
                if (response.ok) {
                    response.json().then(resolve);
                } else {
                    reject();
                }
            }).catch(reject);
        });
    }

    intersectsPoint(point: L.Point) {
        return this.getInfoAtPoint(point);
    }

    // @todo: verwijderen
    async getInfoAtPoint(point: any) {
        if (this.isPoint) {
            return this._getInfoNearPoint(point);
        } else {
            return this._getInfoAtPoint(point);
        }
    }

    getPreviewSize(bbox: number[], width: number) {
        let dx = bbox[2] - bbox[0];
        let dy = bbox[3] - bbox[1];

        return {
            height: Math.round(width * (dy / dx)),
            width: width,
        };
    };

    get preview() {
        let extent = '';
        let bbox = this.boundingBox;
        let widthHeigth = this.getPreviewSize(bbox, 339);

        for (let i = 0; i < 3; i++) {
            extent += bbox[i] + ',';
        }

        extent += bbox.pop();

        return `<img style="max-width: 100%; max-height: 400px; display: block; margin: 0 auto" src="${this.source.url}?service=WMS&request=GetMap&layers=${this.name}&srs=EPSG:28992&bbox=${extent}&width=${widthHeigth.width}&height=${widthHeigth.height}&format=image%2Fpng">`;
    };

    get leaflet() {
        if (this._leaflet) {
            return this._leaflet;
        } else {
            this._leaflet = L.tileLayer.wms(this.source.url, {
                format: 'image/png',
                layers: this.name,
                transparent: true,
            });

            return this._leaflet;
        }
    };

    get legend() {
        try {
            return `<img class="img-responsive" src="${this.capabilities.Style[0].LegendURL[0].OnlineResource}">`;
        } catch (e) {
            return '<p>-</p>';
        }
    };

    private _getInfoAtPoint(point: any): Promise<any> {
        return new Promise<any>(
            (resolve, reject) => {
                if (this.wfscapabilities) {
                    let typename = this.wfscapabilities.Name[0];
                    let field = this.geomField;

                    fetch(this.source.url + url.format({
                        query: {
                            cql_filter: `INTERSECTS(${field}, POINT(${point.x} ${point.y}))`,
                            outputformat: 'application/json',
                            request: 'GetFeature',
                            service: 'WFS',
                            typenames: typename,
                            version: '2.0.0',
                        },
                    })).then((response) => {
                        if (response.ok) {
                            response.json().then(resolve);
                        } else {
                            reject();
                        }
                    }).catch(reject);
                }
            }
        );
    };

    private async _getInfoNearPoint(point: any): Promise<any> {
        let typename = this.wfscapabilities.Name[0];

        let response = await fetch(this.source.url + url.format({
            query: {
                cql_filter: `DWITHIN(${this.geomField}, POINT(${point.x} ${point.y}), ${this._withinDistance}, meters)`,
                outputformat: 'application/json',
                request: 'GetFeature',
                service: 'WFS',
                typenames: typename,
                version: '2.0.0',
            },
        }));

        if (response.ok) {
            return await response.json();
        } else {
            throw new Error('Fetch failed');
        }
    }

    private get typename() {
        if (this.wfscapabilities) {
            return this.wfscapabilities.Name[0];
        } else {
            return this.name;
        }
    }

    private get geomField() {
        if (this._geomField) {
            return this._geomField;
        } else {
            if (this.type) {
                for (let field of this.type) {
                    if (field.$.type.split(':')[0] === 'gml') {
                        this._geomField = field.$.name;
                        break;
                    }
                }
            }

            if (this.source.options.field) {
                this._geomField = this.source.options.field;
            }

            if (!(this._geomField)) {
                console.warn(`Using default geometry field name for ${this.name}`);
                this._geomField = 'geom';
            }

            return this._geomField;
        }
    }

    get isPoint() {
        if (this._isPoint) {
            return this._isPoint;
        } else {
            this._isPoint = false;

            if (this.type) {
                for (let field of this.type) {
                    if (field.$.type.split(':')[0] === 'gml' && field.$.type.toLowerCase().includes('point')) {
                        this._isPoint = true;
                        break;
                    }
                }
            }

            return this._isPoint;
        }
    }
}
