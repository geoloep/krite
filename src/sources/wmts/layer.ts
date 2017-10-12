/*
Copyright 2017 Geoloep

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

import * as L from 'leaflet';

import { WMTSSource } from './source';

import { XMLService } from '../../services/xml';
import { ILayer, IProjectionService } from '../../types';

import pool from '../../servicePool';

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

    private projectService = pool.getService<IProjectionService>('ProjectService');

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

                this._preview = `<img src="${this.url}?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${this.name}&TILEMATRIXSET=${set}&TILEMATRIX=${matrix}&TILEROW=${this.previewRow}&TILECOL=${this.previewCol}&FORMAT=image/png&style=${this.getStyle()}">`;
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
        const identifier = this.projectService.identifiers.leaflet;

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
