import * as L from 'leaflet';

import { WMTSSource } from './source';

import { XMLService } from '../../services/xml';
import { ILayer, IProjectionService } from '../../types';

import pool from '../../servicePool';
const projectService = pool.getService<IProjectionService>('ProjectService');

export class WMTSLayer implements ILayer {
    previewSet = 0;
    previewCol = 0;
    previewRow = 0;

    private _title: string;
    private _name: string;
    // _abstract: string;
    private _preview: string;
    private _legend: string;
    private _leaflet: L.TileLayer;

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
            const tileMatrixSet = this.getTileMatrixSet();

            if (tileMatrixSet) {
                // As of now we take the fist tilematrix set and then the top left tile
                // @todo: get center tile of middle zoom level?

                const set = this.getTileMatrixName(tileMatrixSet);

                const tileMatrix = this.xml.node(tileMatrixSet, `./wmts:TileMatrix[${this.previewSet + 1}]`).snapshotItem(0);

                const matrix = this.xml.string(tileMatrix, './ows:Identifier');

                this._preview = `<img src="${this.url}?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${this.title}&TILEMATRIXSET=${set}&TILEMATRIX=${matrix}&TILEROW=${this.previewRow}&TILECOL=${this.previewCol}&FORMAT=image/png&style=${this.getStyle()}">`;
            }
        }

        return this._preview;
    }

    get leaflet() {
        if (!this._leaflet) {
            // min- / maxZoom could be determined from the capabilities
            const tileMatrixSet = this.getTileMatrixSet();

            this._leaflet = L.tileLayer(this.url + `?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${this.name}&TILEMATRIXSET=${this.getTileMatrixName(tileMatrixSet)}&TILEMATRIX=${this.getTileMatrixPrefix(tileMatrixSet)}{z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png&style=${this.getStyle()}`, {
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

    /**
     * Get the tile matrix set that works with the current map crs
     */
    private getTileMatrixSet() {
        const identifier = projectService.identifiers.leaflet;

        const tileMatrix = this.xml.node(this.document.ownerDocument, `./wmts:Capabilities/wmts:Contents/wmts:TileMatrixSet[./ows:Identifier = '${identifier}']`);

        if (tileMatrix.snapshotLength > 0) {
            return tileMatrix.snapshotItem(0);
        } else {
            throw new Error(`Layer ${this.name} is not available in a tile matrix that is compatible with the map crs (${identifier})`);
        }
    }

    /**
     * Determin the name of the selected Tile Matrix Set
     * @param tileMatrixSet
     */
    private getTileMatrixName(tileMatrixSet: Node) {
        return this.xml.string(tileMatrixSet, './ows:Identifier');
    }

    /**
     * Find out if tilematrix identifier should be prefixed
     */
    private getTileMatrixPrefix(tileMatrixSet: Node) {
        const tileMatrixItem = this.xml.node(tileMatrixSet, `./wmts:TileMatrix[1]`).snapshotItem(0);

        const identifier = this.xml.string(tileMatrixItem, './ows:Identifier');

        // Match everything preceding the last digit(s)
        const prefix = identifier.match(/(.*)\d+$/);

        if (prefix !== null && prefix[1]) {
            return prefix[1];
        } else {
            return '';
        }
    }

    /**
     * Find the name of default style
     */
    private getStyle() {
        const style = this.xml.node(this.document, './wmts:Style[contains(@isDefault, \'true\')]');

        if (style.snapshotLength > 0) {
            const styleNode = style.snapshotItem(0);

            return this.xml.string(styleNode, './Identifier');
        } else {
            return '';
        }
    }
}
