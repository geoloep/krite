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

import { TileLayer } from 'leaflet';

import LayerBase from '../../bases/layer';
import { XMLService } from '../../services/xml';
import { ILayer } from '../../types';

export interface WMTSOptions {
    maxNativeZoom?: number;
    maxZoom?: number;
    minZoom?: number;
    zIndex?: number;
}

export class WMTSLayer extends LayerBase implements ILayer {
    previewSet = 0;
    previewCol = 0;
    previewRow = 0;

    private _preview: string;
    private _leaflet: L.TileLayer;

    private root: XMLService;
    private cache: { [index: string]: any } = {};

    constructor(readonly url: string, readonly node: Node, private options: WMTSOptions = {}) {
        super();

        this.root = new XMLService(node);
    }

    get title() {
        return this.cachedProperty('title', './ows:Title');
    }

    get name() {
        return this.cachedProperty('name', './ows:Identifier');
    }

    get abstract() {
        return 'WMTS Layer';
    }

    get bounds() {
        return undefined;
    }

    get minZoom() {
        return this.options.minZoom;
    }

    get maxZoom() {
        return this.options.maxZoom;
    }

    get zIndex() {
        return this.options.zIndex;
    }

    get preview() {
        if (!this._preview) {
            const tileMatrixSet = this.getTileMatrixSet();

            if (tileMatrixSet) {
                // As of now we take the fist tilematrix set and then the top left tile
                // @todo: get center tile of middle zoom level?

                const set = this.getTileMatrixName(tileMatrixSet);

                const tileMatrix = this.root.node(tileMatrixSet, `./wmts:TileMatrix[${this.previewSet + 1}]`).snapshotItem(0) as Node;

                const matrix = this.root.string(tileMatrix, './ows:Identifier');

                this._preview = `<img src="${this.url}?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${this.name}&TILEMATRIXSET=${set}&TILEMATRIX=${matrix}&TILEROW=${this.previewRow}&TILECOL=${this.previewCol}&FORMAT=image/png&style=${this.getStyle()}">`;
            }
        }

        return this._preview;
    }

    get leaflet() {
        if (!this._leaflet) {
            // min- / maxZoom could be determined from the capabilities
            const tileMatrixSet = this.getTileMatrixSet();

            this._leaflet = new TileLayer(this.url + `?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${this.name}&TILEMATRIXSET=${this.getTileMatrixName(tileMatrixSet)}&TILEMATRIX=${this.getTileMatrixPrefix(tileMatrixSet)}{z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png&style=${this.getStyle()}`, this.options);
        }

        return this._leaflet;
    }

    get legend() {
        return '<p>-</p>';
    }

    private cachedProperty(key: string, path: string) {
        if (!this.cache[key]) {
            this.cache[key] = this.root.string(this.node, path);
        }

        return this.cache[key];
    }

    /**
     * Get the tile matrix set that works with the current map crs
     */
    private getTileMatrixSet() {
        const identifier = this.krite.crs.identifiers.leaflet;

        const tileMatrix = this.root.node(this.node.ownerDocument as Document, `./wmts:Capabilities/wmts:Contents/wmts:TileMatrixSet[./ows:Identifier = '${identifier}']`);

        if (tileMatrix.snapshotLength > 0) {
            return tileMatrix.snapshotItem(0) as Node;
        } else {
            throw new Error(`Layer ${this.name} is not available in a tile matrix that is compatible with the map crs (${identifier})`);
        }
    }

    /**
     * Determin the name of the selected Tile Matrix Set
     * @param tileMatrixSet
     */
    private getTileMatrixName(tileMatrixSet: Node) {
        return this.root.string(tileMatrixSet, './ows:Identifier');
    }

    /**
     * Find out if tilematrix identifier should be prefixed
     */
    private getTileMatrixPrefix(tileMatrixSet: Node) {
        const tileMatrixItem = this.root.node(tileMatrixSet, `./wmts:TileMatrix[1]`).snapshotItem(0);
        let prefix: RegExpMatchArray | null = null;

        if (tileMatrixItem) {
            const identifier = this.root.string(tileMatrixItem, './ows:Identifier');

            // Match everything preceding the last digit(s)
            prefix = identifier.match(/(.*)\d+$/);
        }

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
        const style = this.root.node(this.node, './wmts:Style[contains(@isDefault, \'true\')]');

        if (style.snapshotLength > 0) {
            const styleNode = style.snapshotItem(0);

            if (styleNode) {
                return this.root.string(styleNode, './Identifier');
            } else {
                return '';
            }
        } else {
            return '';
        }
    }
}
