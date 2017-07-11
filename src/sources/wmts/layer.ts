import * as L from 'leaflet';

import { WMTSSource } from './source';

import { ILayer } from '../../types';
import { XMLService } from '../../services/xml';

export class WMTSLayer implements ILayer {
    _title: string;
    _name: string;
    // _abstract: string;
    _preview: string;
    _legend: string;
    _leaflet: L.TileLayer;

    private xml: XMLService;

    constructor(readonly url: string, readonly document: Node) {
        this.xml = new XMLService(document);
    }

    get title(): string {
        if (!this._title) {
            this._title = this.xml.string(this.document, './ows:Title');
        }

        return this._title;
    }

    get name(): string {
        if (!this._name) {
            this._name = this.xml.string(this.document, './ows:Identifier');
        }

        return this._name;
    }

    get abstract() {
        return 'WMTS Layer';
    }

    get bounds(): undefined {
        return undefined;
    }

    get preview() {
        if (!this._preview) {
            let tileMatrixSet = this.getTileMatrixSet();

            if (tileMatrixSet) {
                // As of now we take the fist tilematrix set and then the top left tile
                // @todo: get center tile of middle zoom level?

                let set = this.xml.string(tileMatrixSet, './ows:Identifier');

                let tileMatrix = this.xml.node(tileMatrixSet, './wmts:TileMatrix[1]').snapshotItem(0);

                let matrix = this.xml.string(tileMatrix, './ows:Identifier');

                this._preview = `<img src="${this.url}?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${this.title}&TILEMATRIXSET=${set}&TILEMATRIX=${matrix}&TILEROW=0&TILECOL=0&FORMAT=image/png">`
            }
        }

        return this._preview;
    }

    get leaflet() {
        if (!this._leaflet) {
            // min- / maxZoom could be determined from the capabilities
            this._leaflet = L.tileLayer(this.url + `?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${this.title}&TILEMATRIXSET=EPSG:28992&TILEMATRIX=EPSG:28992:{z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png`, {
                maxZoom: 16,
                minZoom: 3,
                maxNativeZoom: 14,
            });

        }

        return this._leaflet;
    }

    get legend() {
        return '<p>-</p>';
    }

    private getTileMatrixSet() {
        // should be read from map
        let identifier = 'EPSG:28992';

        let tileMatrix = this.xml.node(this.document.ownerDocument, `./wmts:Capabilities/wmts:Contents/wmts:TileMatrixSet[./ows:Identifier = '${identifier}']`);

        if (tileMatrix.snapshotLength > 0) {
            return tileMatrix.snapshotItem(0);
        } else {
            return undefined;
        }
    }
}
