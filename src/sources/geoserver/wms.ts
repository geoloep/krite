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

import { Bounds, LatLng, Point, TileLayer } from 'leaflet';
import { ILayer } from '../../types';

import { Krite } from '../../krite';
import { WFSLayer } from './wfs';

import { LegacyXMLService } from 'src/services/legacyXML';
import { XMLService } from '../../services/xml';


export class WMSLayer implements ILayer {
    _title: string;
    _name: string;
    _abstract: string;
    // _bounds: L.LatLngBounds | undefined;
    _preview: string;
    _leaflet: L.Layer;
    _legend: string;

    xml: XMLService | LegacyXMLService;

    bounds = undefined;

    private krite: Krite;

    constructor(readonly url: string, readonly document: Node, private readonly wfs?: WFSLayer) {
        this.xml = new XMLService(document);
    }

    added(krite: Krite) {
        this.krite = krite;
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
            const bounds = this.getBoundingBox();

            if (bounds && bounds.max && bounds.min) {
                const widthHeigth = this.getPreviewSize(bounds, 339);

                this._preview = `<img style="max-width: 100%; max-height: 400px; display: block; margin: 0 auto" src="${this.url}?service=WMS&request=GetMap&layers=${this.name}&srs=${this.krite.crs.identifiers.leaflet}&bbox=${bounds.min.x},${bounds.min.y},${bounds.max.x},${bounds.max.y}&width=${widthHeigth.width}&height=${widthHeigth.height}&format=image%2Fpng&version=1.1.1&styles=">`;
            } else {
                this._preview = '';
            }

        }

        return this._preview;
    }

    get legend() {
        if (!this._legend) {
            let url: string;

            if ((this.xml as LegacyXMLService).IE) {
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
            this._leaflet = new TileLayer.WMS(this.url, {
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

    async intersectsPoint(point: Point) {
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
        // try to find the bounds in the crs of the application first
        const crsSystems = [
            this.krite.crs.identifiers.leaflet,
            'EPSG:4326',
        ];

        let bounds;
        let boundingBoxNode;
        let fallback = false;

        for (let i = 0; i < crsSystems.length && !bounds; i++) {
            boundingBoxNode = this.xml.node(this.document, `./wms:BoundingBox[@CRS='${crsSystems[i]}']`);

            if (boundingBoxNode.snapshotLength === 1) {
                bounds = boundingBoxNode.snapshotItem(0);
            } else {
                fallback = true;
            }
        }

        if (bounds) {
            if (fallback) {
                const topLeft = new LatLng(this.xml.number(bounds, './@minx'), this.xml.number(bounds, './@maxy'));
                const bottomRight = new LatLng(this.xml.number(bounds, './@maxx'), this.xml.number(bounds, './@miny'));

                return new Bounds(this.krite.crs.pointFrom(topLeft), this.krite.crs.pointFrom(bottomRight));
            } else {
                const topLeft = new Point(this.xml.number(bounds, './@minx'), this.xml.number(bounds, './@maxy'));
                const bottomRight = new Point(this.xml.number(bounds, './@maxx'), this.xml.number(bounds, './@miny'));

                return new Bounds(
                    topLeft,
                    bottomRight,
                );
            }
        }
    }

    private getPreviewSize(bbox: Bounds, width: number) {
        if (!bbox.max || !bbox.min) {
            throw new Error('Min and/or max property of bounds not set!');
        }

        const dx = bbox.max.x - bbox.min.x;
        const dy = bbox.max.y - bbox.min.y;

        return {
            height: Math.round(width * (dy / dx)),
            width,
        };
    }
}
