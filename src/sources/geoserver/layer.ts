import * as L from 'leaflet';
import * as wellknown from 'wellknown';
import * as url from 'url';

import { GeoServerSource } from './source';

import { ILayer, toWKT } from '../../types';

export class GeoserverLayer implements ILayer {
    _leaflet: L.WMS;
    private ZIndex: number = 100;

    constructor(readonly capabilities: any, readonly source: GeoServerSource) {
    };

    get canGetInfoAtPoint() {
        return Boolean(this.source.options.wfs);
    }

    get hasOperations() {
        return Boolean(this.source.options.wfs);
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

    get bounds() {
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

    intersects(feature: string | toWKT | GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.GeometryObject) {
        return new Promise<any>((resolve, reject) => {
            let wkt: string;

            if (typeof feature === 'object') {
                if ((feature as toWKT).toWKT) {
                    wkt = (feature as toWKT).toWKT();
                } else {
                    wkt = wellknown.stringify(feature as GeoJSON.GeometryObject);
                }
            } else {
                wkt = feature;
            }

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

    getInfoAtPoint(point: any): Promise<any> {
        return new Promise<any>(
            (resolve, reject) => {
                let typename = this.name;
                let field = 'geom';

                if (this.source.options.wfsNamespace) {
                    typename = this.source.options.wfsNamespace + ':' + typename;
                }

                if (this.source.options.field) {
                    field = this.source.options.field;
                }

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
        );
    };

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

    private get typename() {
        if (this.source.options.wfsNamespace) {
            return this.source.options.wfsNamespace + ':' + this.name;
        } else {
            return this.name;
        }
    }

    private get geomField() {
        if (this.source.options.field) {
            return this.source.options.field;
        } else {
            return 'geom';
        }
    }
}
