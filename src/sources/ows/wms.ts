import * as L from 'leaflet';
import * as wellknown from 'wellknown';
import * as url from 'url';

// import { OWSSource } from './source';

import { WFSLayer } from './wfs';

import { ILayer } from '../../types';
import { XMLService } from '../../services/xml';

export class WMSLayer implements ILayer {
    _title: string;
    _name: string;
    _abstract: string;
    // _bounds: L.LatLngBounds | undefined;
    _preview: string;
    _leaflet: L.Layer;
    _legend: string;

    xml: XMLService;

    bounds = undefined;

    constructor(readonly url: string, readonly document: Node, private readonly wfs?: WFSLayer) {
        this.xml = new XMLService(document);
    }

    get hasOperations() {
        if (this.wfs) {
            return true;
        } else {
            return false;
        }
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

    get preview() {
        if (!this._preview) {
            let bounds = this.getBoundingBox();

            if (bounds) {
                let widthHeigth = this.getPreviewSize(bounds, 339);

                this._preview = `<img style="max-width: 100%; max-height: 400px; display: block; margin: 0 auto" src="${this.url}?service=WMS&request=GetMap&layers=${this.name}&srs=EPSG:28992&bbox=${bounds.min.x},${bounds.min.y},${bounds.max.x},${bounds.max.y}&width=${widthHeigth.width}&height=${widthHeigth.height}&format=image%2Fpng">`;
            } else {
                this._preview = '';
            }

        }

        return this._preview;
    }

    get legend() {
        if (!this._legend) {
            let url: string;

            if (this.xml.IE) {
                url = this.xml.string(this.document, './wms:Style[1]/wms:LegendURL/wms:OnlineResource/@*[local-name() = \'href\']');
            } else {
                url = this.xml.string(this.document, './wms:Style[1]/wms:LegendURL/wms:OnlineResource/@xlink:href');
            }

            if (url !== '') {
                this._legend = `<img class="img-responsive" src="${url}">`;
            } else {
                this._legend = '<p>-</p>';
            }
        }

        return this._legend;
    }

    get leaflet() {
        if (!this._leaflet) {
            this._leaflet = L.tileLayer.wms(this.url, {
                format: 'image/png',
                layers: this.name,
                transparent: true,
            });
        }

        return this._leaflet;
    }

    async intersects(feature: GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.GeometryObject) {
        if (this.wfs) {
            return await this.wfs.intersects(feature);
        }
    }

    async intersectsPoint(point: L.Point) {
        if (this.wfs) {
            return await this.wfs.intersectsPoint(point);
        }
    }

    async filter(filters: any) {
        if (this.wfs) {
            return await this.wfs.filter(filters);
        }
    }

    private getBoundingBox() {
        let crs = 'EPSG:28992'; // @todo: need to read this from the map

        // Xpath expressions in this function do not work in WGX / IE11
        let BoundingBox = this.xml.node(this.document, `./wms:BoundingBox[@CRS='${crs}']`);

        if (BoundingBox.snapshotLength === 1) {
            let b = BoundingBox.snapshotItem(0);

            return L.bounds(
                L.point(this.xml.number(b, './@minx'), this.xml.number(b, './@maxy')),
                L.point(this.xml.number(b, './@maxx'), this.xml.number(b, './@miny')),
            );
        }
    }

    private getPreviewSize(bbox: L.Bounds, width: number) {
        let dx = bbox.max.x - bbox.min.x;
        let dy = bbox.max.y - bbox.min.y;

        return {
            height: Math.round(width * (dy / dx)),
            width,
        };
    };
}
